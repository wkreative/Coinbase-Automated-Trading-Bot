import { evaluateSymbol } from "../supabase/functions/_shared/strategy/strategy.ts";
import { Candle } from "../supabase/functions/_shared/types.ts";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function runStrategyTests() {
  console.log("🧪 Running Strategy Engine Unit Tests...");

  // Generate 60 test candles with bullish trend & pullback
  const candles: Candle[] = [];
  let price = 50000;
  const now = Date.now();

  for (let i = 0; i < 60; i++) {
    // uptrend
    price += 100;
    candles.push({
      timestamp: now - (60 - i) * 300000,
      open: price - 20,
      high: price + 50,
      low: price - 30,
      close: price,
      volume: 100,
    });
  }

  // Evaluate symbol with strategy engine
  const result = evaluateSymbol("BTC-USD", candles, candles, {
    emaFast: 20,
    emaSlow: 50,
    rsiPeriod: 14,
    rsiMin: 35,
    rsiMax: 80,
    pullbackMin: 0,
    pullbackMax: 10,
    signalScoreMinimum: 50,
  });

  assert(typeof result.shouldTrade === "boolean", "Strategy result should contain boolean shouldTrade");
  assert(typeof result.score === "number", "Strategy result should contain numeric score");
  assert(result.metrics.ema20 > 0, "EMA20 metric should be computed");

  console.log("✅ Strategy Engine Unit Tests Passed!");
}

runStrategyTests();
