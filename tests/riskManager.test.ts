import { validateTradeRisk } from "../supabase/functions/_shared/risk/riskManager.ts";
import { BotSettings, BotState } from "../supabase/functions/_shared/types.ts";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function runRiskTests() {
  console.log("🧪 Running Risk Manager Unit Tests...");

  const defaultSettings: BotSettings = {
    userId: "test-user",
    tradingMode: "PAPER",
    botEnabled: true,
    liveTradingEnabled: false,
    startingCapital: 1000,
    reservedCapital: 400,
    maxTradingCapital: 600,
    maxTotalExposure: 300,
    maxOpenPositions: 2,
    btcMaxPosition: 150,
    ethMaxPosition: 125,
    solMaxPosition: 100,
    takeProfitPercent: 4.0,
    stopLossPercent: 2.5,
    dailyLossLimit: 15,
    weeklyLossLimit: 40,
    maxDrawdownPercent: 10,
    emaFast: 20,
    emaSlow: 50,
    rsiPeriod: 14,
    rsiMin: 35,
    rsiMax: 48,
    pullbackMin: 2.0,
    pullbackMax: 4.5,
    signalScoreMinimum: 75,
    sameAssetCooldownMinutes: 60,
    simulatedFeePercent: 0.6,
    simulatedSlippagePercent: 0.1,
  };

  const defaultState: BotState = {
    userId: "test-user",
    status: "RUNNING",
    currentBalance: 1000,
    availableBalance: 600,
    reservedBalance: 400,
    totalExposure: 0,
    peakBalance: 1000,
    currentDrawdownPercent: 0,
  };

  // Test 1: Normal trade allowed
  const check1 = validateTradeRisk({
    symbol: "BTC-USD",
    settings: defaultSettings,
    state: defaultState,
    openPositions: [],
    recentClosedTrades: [],
    dailyPnl: 0,
    weeklyPnl: 0,
  });
  assert(check1.allowed === true, "Normal trade should be allowed");
  assert(check1.maxAllowedPositionSize === 150, `BTC max position size should be 150, got ${check1.maxAllowedPositionSize}`);

  // Test 2: Halted bot blocked
  const check2 = validateTradeRisk({
    symbol: "BTC-USD",
    settings: defaultSettings,
    state: { ...defaultState, status: "HALTED", currentDrawdownPercent: 11 },
    openPositions: [],
    recentClosedTrades: [],
    dailyPnl: 0,
    weeklyPnl: 0,
  });
  assert(check2.allowed === false, "Halted bot trade should be rejected");

  // Test 3: Daily loss limit exceeded
  const check3 = validateTradeRisk({
    symbol: "BTC-USD",
    settings: defaultSettings,
    state: defaultState,
    openPositions: [],
    recentClosedTrades: [],
    dailyPnl: -16.5,
    weeklyPnl: -16.5,
  });
  assert(check3.allowed === false, "Trade should be blocked when daily loss limit exceeded");

  console.log("✅ Risk Manager Unit Tests Passed!");
}

runRiskTests();
