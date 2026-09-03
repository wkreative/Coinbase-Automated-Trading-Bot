export type TradingMode = "DRY_RUN" | "PAPER" | "LIVE";

export type BotStatus =
  | "STOPPED"
  | "STARTING"
  | "RUNNING"
  | "PAUSED"
  | "HALTED"
  | "ERROR";

export type TradingSymbol =
  | "BTC-USD"
  | "ETH-USD"
  | "SOL-USD";

export type PositionStatus =
  | "PENDING"
  | "OPEN"
  | "CLOSING"
  | "CLOSED"
  | "FAILED";

export type ExitReason =
  | "TAKE_PROFIT"
  | "STOP_LOSS"
  | "MANUAL"
  | "RISK_MANAGER"
  | "EMERGENCY"
  | "ERROR";

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StrategyMetrics {
  price: number;
  ema20: number;
  ema50: number;
  rsi: number;
  recentHigh: number;
  pullbackPercent: number;
  trendValid: boolean;
  pullbackValid: boolean;
  rsiValid: boolean;
  confirmationValid: boolean;
  marketFilterValid: boolean;
}

export interface SignalScoreBreakdown {
  trendScore: number;
  pullbackScore: number;
  rsiScore: number;
  confirmationScore: number;
  marketScore: number;
  totalScore: number;
}

export interface StrategyResult {
  shouldTrade: boolean;
  score: number;
  metrics: StrategyMetrics;
  scoreBreakdown: SignalScoreBreakdown;
  rejectionReasons: string[];
}

export interface BotSettings {
  id?: string;
  userId: string;
  tradingMode: TradingMode;
  botEnabled: boolean;
  liveTradingEnabled: boolean;
  startingCapital: number;
  reservedCapital: number;
  maxTradingCapital: number;
  maxTotalExposure: number;
  maxOpenPositions: number;
  btcMaxPosition: number;
  ethMaxPosition: number;
  solMaxPosition: number;
  takeProfitPercent: number;
  stopLossPercent: number;
  dailyLossLimit: number;
  weeklyLossLimit: number;
  maxDrawdownPercent: number;
  emaFast: number;
  emaSlow: number;
  rsiPeriod: number;
  rsiMin: number;
  rsiMax: number;
  pullbackMin: number;
  pullbackMax: number;
  signalScoreMinimum: number;
  sameAssetCooldownMinutes: number;
  simulatedFeePercent: number;
  simulatedSlippagePercent: number;
}

export interface BotState {
  userId: string;
  status: BotStatus;
  pauseUntil?: string | null;
  pauseReason?: string | null;
  currentBalance: number;
  availableBalance: number;
  reservedBalance: number;
  totalExposure: number;
  peakBalance: number;
  currentDrawdownPercent: number;
  lastRunAt?: string | null;
  lastSuccessfulRunAt?: string | null;
  lastError?: string | null;
}

export interface Position {
  id: string;
  userId: string;
  symbol: TradingSymbol;
  mode: TradingMode;
  side: "BUY" | "SELL";
  status: PositionStatus;
  entryPrice: number;
  quantity: number;
  quoteAmount: number;
  takeProfitPrice: number;
  stopLossPrice: number;
  entryFee: number;
  exitFee: number;
  slippage: number;
  openedAt: string;
  closedAt?: string | null;
  exitPrice?: number | null;
  exitReason?: ExitReason | null;
  grossPnl?: number | null;
  netPnl?: number | null;
  pnlPercent?: number | null;
  signalId?: string | null;
  clientOrderId?: string | null;
}

export interface BotRuntime {
  id?: string;
  userId: string;
  enabled: boolean;
  tradingMode: TradingMode;
  status: BotStatus;
  lastHeartbeat?: string | null;
  lastCycle?: string | null;
  currentError?: string | null;
  startedAt?: string | null;
  stoppedAt?: string | null;
  strategyVersion: string;
  consecutiveLosses: number;
  pauseUntil?: string | null;
}

export interface ApiConnectionStatus {
  coinbaseConnected: boolean;
  marketDataConnected: boolean;
  canView: boolean;
  canTrade: boolean;
  canWithdraw: boolean;
  usdBalance: number;
  latencyMs: number;
  lastTestedAt?: string;
}

export type HealthStatusLevel = "GREEN" | "YELLOW" | "RED";

export interface SystemHealthStatus {
  overall: HealthStatusLevel;
  coinbaseMarketData: HealthStatusLevel;
  coinbasePrivateApi: HealthStatusLevel;
  supabase: HealthStatusLevel;
  botWorker: HealthStatusLevel;
  lastHeartbeat: string | null;
  marketDataAgeSeconds: number;
  lastCandleTimestamp: string | null;
  tradingMode: TradingMode;
  apiPermissions: {
    view: boolean;
    trade: boolean;
    withdraw: boolean;
  };
  openPositionsCount: number;
  openOrdersCount: number;
  lastSuccessfulCycle: string | null;
}

