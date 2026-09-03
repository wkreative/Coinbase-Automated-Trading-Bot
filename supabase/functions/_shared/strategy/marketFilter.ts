import { Candle } from "../types.ts";

export interface MarketFilterResult {
  isRiskOff: boolean;
  btc4hChangePercent: number;
  btc24hChangePercent: number;
  reason?: string;
}

/**
 * Requirement #6: General Market Risk Filter.
 * Checks BTC movement over the last 4 hours (48 candles of 5m) and 24 hours (288 candles of 5m).
 * If BTC falls > 4% in last 4 hours => RISK_OFF (No new trades).
 * If BTC falls > 7% in last 24 hours => 12h pause condition logged.
 */
export function evaluateMarketFilter(btcCandles: Candle[]): MarketFilterResult {
  if (!btcCandles || btcCandles.length < 48) {
    return {
      isRiskOff: false,
      btc4hChangePercent: 0,
      btc24hChangePercent: 0,
    };
  }

  const currentPrice = btcCandles[btcCandles.length - 1].close;

  // 4 hours = 48 candles of 5 min
  const candle4hAgo = btcCandles[Math.max(0, btcCandles.length - 48)];
  const btc4hChangePercent = ((currentPrice - candle4hAgo.close) / candle4hAgo.close) * 100;

  // 24 hours = 288 candles of 5 min
  const candle24hAgo = btcCandles[Math.max(0, btcCandles.length - Math.min(288, btcCandles.length))];
  const btc24hChangePercent = ((currentPrice - candle24hAgo.close) / candle24hAgo.close) * 100;

  let isRiskOff = false;
  let reason: string | undefined;

  if (btc4hChangePercent <= -4.0) {
    isRiskOff = true;
    reason = `BTC 4h drop (${btc4hChangePercent.toFixed(2)}%) exceeds -4.0% limit. Market status = RISK_OFF.`;
  } else if (btc24hChangePercent <= -7.0) {
    isRiskOff = true;
    reason = `BTC 24h drop (${btc24hChangePercent.toFixed(2)}%) exceeds -7.0% limit. Market status = RISK_OFF.`;
  }

  return {
    isRiskOff,
    btc4hChangePercent,
    btc24hChangePercent,
    reason,
  };
}
