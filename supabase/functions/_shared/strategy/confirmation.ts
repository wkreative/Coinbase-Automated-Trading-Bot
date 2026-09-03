import { Candle } from "../types.ts";

/**
 * Requirement #11: Candle Confirmation
 * Checks if recovery condition is met:
 * 1. Current candle close > previous candle close
 * 2. Current candle close > current candle open (bullish green candle)
 */
export function checkCandleConfirmation(candles: Candle[]): boolean {
  if (!candles || candles.length < 2) return false;

  const currentCandle = candles[candles.length - 1];
  const prevCandle = candles[candles.length - 2];

  const closesHigherThanPrev = currentCandle.close > prevCandle.close;
  const isBullishGreen = currentCandle.close > currentCandle.open;

  return closesHigherThanPrev && isBullishGreen;
}
