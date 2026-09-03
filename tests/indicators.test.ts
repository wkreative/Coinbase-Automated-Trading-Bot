import { calculateEMA } from "../supabase/functions/_shared/indicators/ema.ts";
import { calculateRSI } from "../supabase/functions/_shared/indicators/rsi.ts";
import { calculatePullback } from "../supabase/functions/_shared/indicators/pullback.ts";
import { calculateATR } from "../supabase/functions/_shared/indicators/atr.ts";
import { Candle } from "../supabase/functions/_shared/types.ts";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function runTests() {
  console.log("🧪 Running Indicator Unit Tests...");

  // 1. EMA Test
  const prices = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29];
  const ema20 = calculateEMA(prices, 20);
  assert(ema20.length === 1, "EMA 20 should produce 1 value for 20 elements");
  assert(ema20[0] === 19.5, `EMA initial SMA should be 19.5, got ${ema20[0]}`);

  // 2. Pullback Test
  const pb1 = calculatePullback(95, 100);
  assert(pb1 === -5, `Pullback should be -5%, got ${pb1}`);

  const pb2 = calculatePullback(100, 100);
  assert(pb2 === 0, `Pullback should be 0%, got ${pb2}`);

  // 3. RSI Test
  const rsiCloses = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109, 111, 110, 112, 114, 113, 115];
  const rsi = calculateRSI(rsiCloses, 14);
  assert(rsi.length > 0, "RSI should produce results");
  assert(rsi[0] > 50 && rsi[0] < 100, `RSI should be in valid bullish range, got ${rsi[0]}`);

  // 4. ATR Test
  const mockCandles: Candle[] = Array.from({ length: 20 }, (_, i) => ({
    timestamp: Date.now() - i * 300000,
    open: 100 + i,
    high: 105 + i,
    low: 98 + i,
    close: 103 + i,
    volume: 10,
  }));
  const atr = calculateATR(mockCandles, 14);
  assert(atr > 0, `ATR should be > 0, got ${atr}`);

  console.log("✅ All Indicator Tests Passed Successfully!");
}

runTests();
