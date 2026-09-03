import { NextResponse } from "next/server";
import { getCoinbaseMarketCandles } from "@/lib/services/coinbase";
import { evaluateSymbol } from "@/lib/services/strategy";
import { DEFAULT_CONFIG } from "@/lib/config";
import { TradingSymbol } from "@/lib/types";

export async function GET() {
  try {
    const symbols: TradingSymbol[] = ["BTC-USD", "ETH-USD", "SOL-USD"];

    // Fetch BTC candles for general market filter evaluation
    const btcCandleData = await getCoinbaseMarketCandles("BTC-USD", 100);

    const assetMetrics = await Promise.all(
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
          status: evalResult.shouldTrade ? "READY" : "WAIT",
          rejectionReasons: evalResult.rejectionReasons,
          latestCandleTimestamp: candleData.latestTimestamp,
          dataAgeSeconds: candleData.dataAgeSeconds,
          isFresh: candleData.isFresh,
        };
      })
    );

    const maxDataAge = Math.max(...assetMetrics.map((a) => a.dataAgeSeconds));
    const isFeedHealthy = maxDataAge <= DEFAULT_CONFIG.marketDataMaxAgeSeconds;

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      isFeedHealthy,
      maxDataAgeSeconds: maxDataAge,
      assets: assetMetrics,
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to fetch real market data from Coinbase" },
      { status: 500 }
    );
  }
}
