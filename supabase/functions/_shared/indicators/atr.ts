import { Candle } from "../types.ts";

/**
  Calculates Average True Range (ATR) for volatility estimation.
 */
export function calculateATR(candles: Candle[], period = 14): number {
  if (!candles || candles.length <= period) return 0;

  const trueRanges: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const current = candles[i];
    const previous = candles[i - 1];

    const tr1 = current.high - current.low;
    const tr2 = Math.abs(current.high - previous.close);
    const tr3 = Math.abs(current.low - previous.close);

    const trueRange = Math.max(tr1, tr2, tr3);
    trueRanges.push(trueRange);
  }

  if (trueRanges.length < period) return 0;

  let atr = trueRanges.slice(0, period).reduce((sum, tr) => sum + tr, 0) / period;

  for (let i = period; i < trueRanges.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period;
  }

  return atr;
}
