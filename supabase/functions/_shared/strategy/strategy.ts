import { Candle, StrategyResult, TradingSymbol } from "../types.ts";
import { calculateEMA, calculateRSI, calculatePullback } from "../indicators/index.ts";
import { evaluateMarketFilter } from "./marketFilter.ts";
import { checkCandleConfirmation } from "./confirmation.ts";
import { calculateSignalScore } from "./signalScore.ts";

export interface StrategyConfig {
  emaFast: number;
  emaSlow: number;
  rsiPeriod: number;
  rsiMin: number;
  rsiMax: number;
  pullbackMin: number;
  pullbackMax: number;
  signalScoreMinimum: number;
}

export function evaluateSymbol(
  symbol: TradingSymbol,
  candles: Candle[],
  btcCandles: Candle[],
  config: StrategyConfig
): StrategyResult {
  const rejectionReasons: string[] = [];

  if (!candles || candles.length < Math.max(config.emaSlow, 50)) {
    return {
      shouldTrade: false,
      score: 0,
      metrics: {
        price: candles && candles.length > 0 ? candles[candles.length - 1].close : 0,
        ema20: 0,
        ema50: 0,
        rsi: 0,
        recentHigh: 0,
        pullbackPercent: 0,
        trendValid: false,
        pullbackValid: false,
        rsiValid: false,
        confirmationValid: false,
        marketFilterValid: false,
      },
      scoreBreakdown: {
        trendScore: 0,
        pullbackScore: 0,
        rsiScore: 0,
        confirmationScore: 0,
        marketScore: 0,
        totalScore: 0,
      },
      rejectionReasons: ["Insufficient candle history"],
    };
  }

  const closes = candles.map((c) => c.close);
  const currentPrice = closes[closes.length - 1];

  // 1. Calculate Indicators
  const ema20Series = calculateEMA(closes, config.emaFast);
  const ema50Series = calculateEMA(closes, config.emaSlow);
  const rsiSeries = calculateRSI(closes, config.rsiPeriod);

  const ema20 = ema20Series.length > 0 ? ema20Series[ema20Series.length - 1] : 0;
  const ema50 = ema50Series.length > 0 ? ema50Series[ema50Series.length - 1] : 0;
  const rsi = rsiSeries.length > 0 ? rsiSeries[rsiSeries.length - 1] : 50;

  // 2. Recent High (last 24 candles of 5m = 2 hours)
  const windowCandles = candles.slice(-24);
  const recentHigh = Math.max(...windowCandles.map((c) => c.high));
  const pullbackPercent = calculatePullback(currentPrice, recentHigh);

  // 3. Evaluate Rule Conditions
  const trendValid = ema20 > ema50;
  if (!trendValid) {
    rejectionReasons.push(`EMA Trend condition failed: EMA20 (${ema20.toFixed(2)}) <= EMA50 (${ema50.toFixed(2)})`);
  }

  const pbAbs = Math.abs(pullbackPercent);
  const pullbackValid = pullbackPercent < 0 && pbAbs >= config.pullbackMin && pbAbs <= config.pullbackMax;
  if (!pullbackValid) {
    rejectionReasons.push(
      `Pullback (${pullbackPercent.toFixed(2)}%) out of valid range [-${config.pullbackMin}%, -${config.pullbackMax}%]`
    );
  }

  const rsiValid = rsi >= config.rsiMin && rsi <= config.rsiMax;
  if (!rsiValid) {
    rejectionReasons.push(`RSI (${rsi.toFixed(2)}) outside range [${config.rsiMin}, ${config.rsiMax}]`);
  }

  const confirmationValid = checkCandleConfirmation(candles);
  if (!confirmationValid) {
    rejectionReasons.push("Recovery candle confirmation failed (needs close > prev_close and green candle)");
  }

  const marketFilter = evaluateMarketFilter(btcCandles);
  const marketFilterValid = !marketFilter.isRiskOff;
  if (marketFilter.isRiskOff) {
    rejectionReasons.push(`General market risk filter active: ${marketFilter.reason}`);
  }

  // 4. Calculate Signal Score
  const scoreBreakdown = calculateSignalScore({
    trendValid,
    pullbackPercent,
    pullbackMin: config.pullbackMin,
    pullbackMax: config.pullbackMax,
    rsi,
    rsiMin: config.rsiMin,
    rsiMax: config.rsiMax,
    confirmationValid,
    marketFilterValid,
  });

  if (scoreBreakdown.totalScore < config.signalScoreMinimum) {
    rejectionReasons.push(
      `Signal score (${scoreBreakdown.totalScore}) below minimum threshold (${config.signalScoreMinimum})`
    );
  }

  const shouldTrade =
    trendValid &&
    pullbackValid &&
    rsiValid &&
    confirmationValid &&
    marketFilterValid &&
    scoreBreakdown.totalScore >= config.signalScoreMinimum;

  return {
    shouldTrade,
    score: scoreBreakdown.totalScore,
    metrics: {
      price: currentPrice,
      ema20,
      ema50,
      rsi,
      recentHigh,
      pullbackPercent,
      trendValid,
      pullbackValid,
      rsiValid,
      confirmationValid,
      marketFilterValid,
    },
    scoreBreakdown,
    rejectionReasons,
  };
}
