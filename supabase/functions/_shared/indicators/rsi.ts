/**
  Calculates Relative Strength Index (RSI) using Wilder's Smoothing method.
 */
export function calculateRSI(closes: number[], period = 14): number[] {
  if (!closes || closes.length <= period) return [];

  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // Initial average gain & loss
  let avgGain = gains.slice(0, period).reduce((sum, g) => sum + g, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((sum, l) => sum + l, 0) / period;

  const rsiResults: number[] = [];

  const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const firstRSI = avgLoss === 0 ? 100 : 100 - 100 / (1 + firstRS);
  rsiResults.push(firstRSI);

  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

    if (avgLoss === 0) {
      rsiResults.push(100);
    } else {
      const rs = avgGain / avgLoss;
      const rsi = 100 - 100 / (1 + rs);
      rsiResults.push(rsi);
    }
  }

  return rsiResults;
}
