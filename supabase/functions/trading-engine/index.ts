import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCandles, createMarketBuy, createMarketSell, isLiveTradingAllowed } from "../_shared/coinbase/client.ts";
import { evaluateSymbol } from "../_shared/strategy/strategy.ts";
import { validateTradeRisk } from "../_shared/risk/riskManager.ts";
import { TradingSymbol, BotSettings, BotState, Position } from "../_shared/types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. In-memory / mock database store for standalone Deno Edge runtime fallback
    const symbols: TradingSymbol[] = ["BTC-USD", "ETH-USD", "SOL-USD"];

    // Default configuration for simulation
    const settings: BotSettings = {
      userId: "00000000-0000-0000-0000-000000000001",
      tradingMode: (Deno.env.get("TRADING_MODE") as "PAPER" | "LIVE") || "PAPER",
      botEnabled: true,
      liveTradingEnabled: Deno.env.get("LIVE_TRADING_ENABLED") === "true",
      startingCapital: 1000,
      reservedCapital: 400,
      maxTradingCapital: 600,
      maxTotalExposure: 300,
      maxOpenPositions: 2,
      btcMaxPosition: 150,
      ethMaxPosition: 125,
      solMaxPosition: 100,
      takeProfitPercent: 4.0,
      stopLossPercent: 2.5,
      dailyLossLimit: 15,
      weeklyLossLimit: 40,
      maxDrawdownPercent: 10,
      emaFast: 20,
      emaSlow: 50,
      rsiPeriod: 14,
      rsiMin: 35,
      rsiMax: 48,
      pullbackMin: 2.0,
      pullbackMax: 4.5,
      signalScoreMinimum: 75,
      sameAssetCooldownMinutes: 60,
      simulatedFeePercent: 0.6,
      simulatedSlippagePercent: 0.1,
    };

    const btcCandles = await getCandles("BTC-USD", "FIVE_MINUTE", 100);
    const scannedAssets: Array<Record<string, unknown>> = [];
    let tradesOpened = 0;
    let signalsGenerated = 0;

    for (const symbol of symbols) {
      const candles = symbol === "BTC-USD" ? btcCandles : await getCandles(symbol, "FIVE_MINUTE", 100);
      const evalResult = evaluateSymbol(symbol, candles, btcCandles, {
        emaFast: settings.emaFast,
        emaSlow: settings.emaSlow,
        rsiPeriod: settings.rsiPeriod,
        rsiMin: settings.rsiMin,
        rsiMax: settings.rsiMax,
        pullbackMin: settings.pullbackMin,
        pullbackMax: settings.pullbackMax,
        signalScoreMinimum: settings.signalScoreMinimum,
      });

      if (evalResult.shouldTrade) {
        signalsGenerated++;

        // Risk Engine check
        const riskCheck = validateTradeRisk({
          symbol,
          settings,
          state: {
            userId: settings.userId,
            status: "RUNNING",
            currentBalance: 1000,
            availableBalance: 600,
            reservedBalance: 400,
            totalExposure: 0,
            peakBalance: 1000,
            currentDrawdownPercent: 0,
          },
          openPositions: [],
          recentClosedTrades: [],
          dailyPnl: 0,
          weeklyPnl: 0,
        });

        if (riskCheck.allowed && riskCheck.maxAllowedPositionSize) {
          const clientOrderId = `bot-${Date.now()}-${symbol}`;

          if (settings.tradingMode === "LIVE") {
            if (!isLiveTradingAllowed()) {
              throw new Error("LIVE trading is disabled by safety environment configuration.");
            }
            await createMarketBuy(symbol, riskCheck.maxAllowedPositionSize, clientOrderId);
          }
          tradesOpened++;
        }
      }

      scannedAssets.push({
        symbol,
        price: evalResult.metrics.price,
        ema20: evalResult.metrics.ema20,
        ema50: evalResult.metrics.ema50,
        rsi: evalResult.metrics.rsi,
        pullbackPercent: evalResult.metrics.pullbackPercent,
        score: evalResult.score,
        shouldTrade: evalResult.shouldTrade,
        rejectionReasons: evalResult.rejectionReasons,
      });
    }

    const responseBody = {
      success: true,
      timestamp: new Date().toISOString(),
      tradingMode: settings.tradingMode,
      symbolsScanned: symbols.length,
      signalsGenerated,
      tradesOpened,
      scannedAssets,
    };

    return new Response(JSON.stringify(responseBody), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const err = error as Error;
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Trading Engine Error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
