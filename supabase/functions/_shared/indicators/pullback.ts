/**
  Calculates pullback percentage from recent high price.
  Formula: ((currentPrice - recentHigh) / recentHigh) * 100
  Result is negative during a pullback (e.g. -3.2%).
 */
export function calculatePullback(currentPrice: number, recentHigh: number): number {
  if (recentHigh <= 0) return 0;
  return ((currentPrice - recentHigh) / recentHigh) * 100;
}
