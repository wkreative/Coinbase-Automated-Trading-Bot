import { NextResponse } from "next/server";
import { getCoinbaseMarketCandles } from "@/lib/services/coinbase";
import { evaluateSymbol } from "@/lib/services/strategy";
import { DEFAULT_CONFIG } from "@/lib/config";
import { TradingSymbol, Position } from "@/lib/types";
import { getAdminSupabase } from "@/lib/supabase/admin";

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

async function executeTradingCycle() {
  const symbols: TradingSymbol[] = ["BTC-USD", "ETH-USD", "SOL-USD"];
  const supabase = getAdminSupabase();

  // Fetch candles
  const btcCandleData = await getCoinbaseMarketCandles("BTC-USD", 100);

  const scannedAssets = await Promise.all(
    symbols.map(async (symbol) => {
      const candleData =
        symbol === "BTC-USD"
          ? btcCandleData
          : await getCoinbaseMarketCandles(symbol, 100);

      const evalResult = evaluateSymbol(
        symbol,
        candleData.candles,
        btcCandleData.candles,
        {
          emaFast: DEFAULT_CONFIG.emaFast,
          emaSlow: DEFAULT_CONFIG.emaSlow,
          rsiPeriod: DEFAULT_CONFIG.rsiPeriod,
          rsiMin: 35,
          rsiMax: 48,
          pullbackMin: 2.0,
          pullbackMax: 4.5,
          signalScoreMinimum: DEFAULT_CONFIG.signalThreshold,
        }
      );

      return {
        symbol,
        price: evalResult.metrics.price,
        ema20: evalResult.metrics.ema20,
        ema50: evalResult.metrics.ema50,
        rsi: evalResult.metrics.rsi,
        pullbackPercent: evalResult.metrics.pullbackPercent,
        score: evalResult.score,
        shouldTrade: evalResult.shouldTrade,
        rejectionReasons: evalResult.rejectionReasons,
      };
    })
  );

  let tradesOpened = 0;
  let positionsClosed = 0;
  const cycleLogs: string[] = [];

  cycleLogs.push(`Market scan executed at ${new Date().toISOString()}`);

  if (supabase) {
    // 1. Fetch active state and positions from Supabase DB
    const { data: stateData } = await supabase
      .from("bot_state")
      .select("*")
      .eq("user_id", DEFAULT_USER_ID)
      .maybeSingle();

    const { data: openPositionsData } = await supabase
      .from("positions")
      .select("*")
      .eq("user_id", DEFAULT_USER_ID)
      .eq("status", "OPEN");

    const currentStatus = stateData?.status || "RUNNING";

    if (currentStatus === "RUNNING" || currentStatus === "PAUSED") {
      const positions: Position[] = openPositionsData || [];

      // 2. Evaluate Take Profit and Stop Loss for open positions
      for (const pos of positions) {
        const asset = scannedAssets.find((a) => a.symbol === pos.symbol);
        if (!asset) continue;

        let exitReason: "TAKE_PROFIT" | "STOP_LOSS" | null = null;
        if (asset.price >= pos.takeProfitPrice) exitReason = "TAKE_PROFIT";
        else if (asset.price <= pos.stopLossPrice) exitReason = "STOP_LOSS";

        if (exitReason) {
          const grossPnl = (asset.price - pos.entryPrice) * pos.quantity;
          const exitFee = (pos.quoteAmount * 0.6) / 100;
          const netPnl = grossPnl - pos.entryFee - exitFee;
          const pnlPercent = (netPnl / pos.quoteAmount) * 100;

          await supabase
            .from("positions")
            .update({
              status: "CLOSED",
              closed_at: new Date().toISOString(),
              exit_price: asset.price,
              exit_reason: exitReason,
              exit_fee: exitFee,
              gross_pnl: grossPnl,
              net_pnl: netPnl,
              pnl_percent: pnlPercent,
            })
            .eq("id", pos.id);

          // Record log
          await supabase.from("bot_logs").insert({
            user_id: DEFAULT_USER_ID,
            level: netPnl >= 0 ? "INFO" : "WARNING",
            category: "TRADE_CLOSED",
            message: `[Cron Server Engine] Closed position ${pos.symbol} via ${exitReason} @ $${asset.price}. Net PnL: $${netPnl.toFixed(2)} (${pnlPercent.toFixed(2)}%)`,
          });

          positionsClosed++;
          cycleLogs.push(`Closed position ${pos.symbol} via ${exitReason}`);
        }
      }

      // 3. Open new positions if status is RUNNING
      if (currentStatus === "RUNNING" && positions.length < 2) {
        const candidate = scannedAssets.find(
          (a) => a.shouldTrade && !positions.some((p) => p.symbol === a.symbol)
        );

        if (candidate) {
          const size = candidate.symbol === "BTC-USD" ? 150 : candidate.symbol === "ETH-USD" ? 125 : 100;
          const entryFee = (size * 0.6) / 100;
          const tpPrice = Number((candidate.price * 1.04).toFixed(2));
          const slPrice = Number((candidate.price * 0.975).toFixed(2));

          const { data: newSignal } = await supabase
            .from("signals")
            .insert({
              user_id: DEFAULT_USER_ID,
              symbol: candidate.symbol,
              price: candidate.price,
              ema20: candidate.ema20,
              ema50: candidate.ema50,
              rsi: candidate.rsi,
              pullback_percent: candidate.pullbackPercent,
              total_score: candidate.score,
              decision: "BUY",
            })
            .select()
            .single();

          await supabase.from("positions").insert({
            user_id: DEFAULT_USER_ID,
            symbol: candidate.symbol,
            mode: "PAPER",
            side: "BUY",
            status: "OPEN",
            entry_price: candidate.price,
            quantity: Number((size / candidate.price).toFixed(6)),
            quote_amount: size,
            take_profit_price: tpPrice,
            stop_loss_price: slPrice,
            entry_fee: entryFee,
            opened_at: new Date().toISOString(),
            signal_id: newSignal?.id || null,
          });

          await supabase.from("bot_logs").insert({
            user_id: DEFAULT_USER_ID,
            level: "INFO",
            category: "TRADE_OPENED",
            message: `[Cron Server Engine] Opened PAPER position for ${candidate.symbol} @ $${candidate.price}. TP: $${tpPrice}, SL: $${slPrice}`,
          });

          tradesOpened++;
          cycleLogs.push(`Opened new position for ${candidate.symbol}`);
        }
      }

      // 4. Update last_run_at timestamp
      await supabase
        .from("bot_state")
        .upsert({
          user_id: DEFAULT_USER_ID,
          last_run_at: new Date().toISOString(),
          last_successful_run_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
    }
  }

  return {
    timestamp: new Date().toISOString(),
    isFeedHealthy: true,
    scannedAssets,
    tradesOpened,
    positionsClosed,
    cycleLogs,
  };
}

export async function GET(req: Request) {
  try {
    const cronSecret = process.env.BOT_CRON_SECRET;
    const authHeader = req.headers.get("authorization");
    const customHeader = req.headers.get("x-cron-secret");

    if (cronSecret && cronSecret !== "local-cron-secret") {
      const isValid =
        customHeader === cronSecret ||
        authHeader === `Bearer ${cronSecret}`;

      if (!isValid) {
        return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
      }
    }

    const result = await executeTradingCycle();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || "Failed to run cron trading cycle" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
