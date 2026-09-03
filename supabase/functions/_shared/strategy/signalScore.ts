import { SignalScoreBreakdown } from "../types.ts";

export function calculateSignalScore(params: {
  trendValid: boolean;
  pullbackPercent: number;
  pullbackMin: number;
  pullbackMax: number;
  rsi: number;
  rsiMin: number;
  rsiMax: number;
  confirmationValid: boolean;
  marketFilterValid: boolean;
}): SignalScoreBreakdown {
  let trendScore = 0;
  let pullbackScore = 0;
  let rsiScore = 0;
  let confirmationScore = 0;
  let marketScore = 0;

  // 1. Trend Score (Max 25 pts)
  if (params.trendValid) {
    trendScore = 25;
  }

  // 2. Pullback Score (Max 25 pts)
  // Ideal pullback is right in the middle of pullbackMin and pullbackMax (-3.25%)
  const pbAbs = Math.abs(params.pullbackPercent);
  if (pbAbs >= params.pullbackMin && pbAbs <= params.pullbackMax) {
    const idealPb = (params.pullbackMin + params.pullbackMax) / 2;
    const distance = Math.abs(pbAbs - idealPb);
    pullbackScore = Math.max(15, Math.round(25 - distance * 5));
  }

  // 3. RSI Score (Max 25 pts)
  if (params.rsi >= params.rsiMin && params.rsi <= params.rsiMax) {
    // Ideal RSI is around 40-42
    const idealRsi = (params.rsiMin + params.rsiMax) / 2;
    const distance = Math.abs(params.rsi - idealRsi);
    rsiScore = Math.max(15, Math.round(25 - distance * 1.5));
  }

  // 4. Confirmation Score (Max 15 pts)
  if (params.confirmationValid) {
    confirmationScore = 15;
  }

  // 5. Market Condition Score (Max 10 pts)
  if (params.marketFilterValid) {
    marketScore = 10;
  }

  const totalScore = trendScore + pullbackScore + rsiScore + confirmationScore + marketScore;

  return {
    trendScore,
    pullbackScore,
    rsiScore,
    confirmationScore,
    marketScore,
    totalScore,
  };
}
