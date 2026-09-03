/**
  Calculates Exponential Moving Average (EMA) for an array of numeric values.
  Uses SMA for initial value, then standard multiplier: 2 / (period + 1).
 */
export function calculateEMA(values: number[], period: number): number[] {
  if (!values || values.length < period) return [];

  const multiplier = 2 / (period + 1);

  // Initial Simple Moving Average (SMA)
  const initialSMA =
    values
      .slice(0, period)
      .reduce((sum, value) => sum + value, 0) / period;

  const result: number[] = [initialSMA];

  for (let i = period; i < values.length; i++) {
    const previous = result[result.length - 1];
    const ema = (values[i] - previous) * multiplier + previous;
    result.push(ema);
  }

  return result;
}
