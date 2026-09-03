import { BotSettings, BotState, Position, TradingSymbol } from "../types.ts";

export interface RiskValidationResult {
  allowed: boolean;
  reason?: string;
  maxAllowedPositionSize?: number;
}

export interface TradeHistoryItem {
  symbol: TradingSymbol;
  netPnl: number;
  closedAt: string;
}

export function validateTradeRisk(params: {
  symbol: TradingSymbol;
  settings: BotSettings;
  state: BotState;
  openPositions: Position[];
  recentClosedTrades: TradeHistoryItem[];
  dailyPnl: number;
  weeklyPnl: number;
}): RiskValidationResult {
  const { symbol, settings, state, openPositions, recentClosedTrades, dailyPnl, weeklyPnl } = params;

  // 1. Check Bot Status
  if (state.status === "HALTED") {
    return {
      allowed: false,
      reason: "Bot is HALTED due to maximum drawdown threshold (10%). Manual reactivation required.",
    };
  }

  if (state.status === "STOPPED" || state.status === "PAUSED" || state.status === "ERROR") {
    return {
      allowed: false,
      reason: `Bot status is currently ${state.status}.`,
    };
  }

  if (state.pauseUntil && new Date(state.pauseUntil) > new Date()) {
    return {
      allowed: false,
      reason: `Bot is under temporary risk pause until ${state.pauseUntil}. Reason: ${state.pauseReason}`,
    };
  }

  // 2. Maximum Drawdown Check (>= 10%)
  if (state.currentDrawdownPercent >= settings.maxDrawdownPercent) {
    return {
      allowed: false,
      reason: `Maximum drawdown limit reached (${state.currentDrawdownPercent.toFixed(2)}% >= ${settings.maxDrawdownPercent}%).`,
    };
  }

  // 3. Daily Loss Limit ($15)
  if (dailyPnl <= -settings.dailyLossLimit) {
    return {
      allowed: false,
      reason: `Daily loss limit reached ($${Math.abs(dailyPnl).toFixed(2)} >= $${settings.dailyLossLimit}). Paused until next UTC day.`,
    };
  }

  // 4. Weekly Loss Limit ($40)
  if (weeklyPnl <= -settings.weeklyLossLimit) {
    return {
      allowed: false,
      reason: `Weekly loss limit reached ($${Math.abs(weeklyPnl).toFixed(2)} >= $${settings.weeklyLossLimit}). Paused until next week.`,
    };
  }

  // 5. Consecutive & 24h Losing Trade Circuit Breakers
  const lossesIn24h = recentClosedTrades.filter(
    (t) => t.netPnl < 0 && new Date().getTime() - new Date(t.closedAt).getTime() <= 24 * 60 * 60 * 1000
  );

  if (lossesIn24h.length >= 3) {
    return {
      allowed: false,
      reason: "Circuit breaker triggered: 3 losing trades in the last 24 hours.",
    };
  }

  // Consecutive losses check
  if (recentClosedTrades.length >= 2) {
    const lastTwo = recentClosedTrades.slice(0, 2);
    if (lastTwo.every((t) => t.netPnl < 0)) {
      return {
        allowed: false,
        reason: "Circuit breaker triggered: 2 consecutive losing trades. Entry paused for 12 hours.",
      };
    }
  }

  // 6. Max Open Positions Limit (2)
  if (openPositions.length >= settings.maxOpenPositions) {
    return {
      allowed: false,
      reason: `Maximum open positions limit reached (${openPositions.length}/${settings.maxOpenPositions}).`,
    };
  }

  // 7. Check if asset already has an open position
  if (openPositions.some((p) => p.symbol === symbol)) {
    return {
      allowed: false,
      reason: `Position already open for asset ${symbol}.`,
    };
  }

  // 8. Same Asset Cooldown Check (60 minutes)
  const lastAssetTrade = recentClosedTrades.find((t) => t.symbol === symbol);
  if (lastAssetTrade) {
    const minutesSinceClosed = (new Date().getTime() - new Date(lastAssetTrade.closedAt).getTime()) / (1000 * 60);
    if (minutesSinceClosed < settings.sameAssetCooldownMinutes) {
      return {
        allowed: false,
        reason: `Cooldown active for ${symbol}: ${Math.round(settings.sameAssetCooldownMinutes - minutesSinceClosed)} minutes remaining.`,
      };
    }
  }

  // 9. Total Exposure & Asset Position Size Allocation
  let maxAssetSize = settings.btcMaxPosition;
  if (symbol === "ETH-USD") maxAssetSize = settings.ethMaxPosition;
  if (symbol === "SOL-USD") maxAssetSize = settings.solMaxPosition;

  const currentTotalExposure = openPositions.reduce((sum, p) => sum + p.quoteAmount, 0);
  const remainingExposureLimit = settings.maxTotalExposure - currentTotalExposure;

  if (remainingExposureLimit <= 0) {
    return {
      allowed: false,
      reason: `Maximum total exposure limit ($${settings.maxTotalExposure}) reached.`,
    };
  }

  const finalAllowedPositionSize = Math.min(maxAssetSize, remainingExposureLimit, state.availableBalance);

  if (finalAllowedPositionSize < 10) {
    return {
      allowed: false,
      reason: `Calculated position size ($${finalAllowedPositionSize.toFixed(2)}) is below minimum trading threshold ($10).`,
    };
  }

  return {
    allowed: true,
    maxAllowedPositionSize: finalAllowedPositionSize,
  };
}
