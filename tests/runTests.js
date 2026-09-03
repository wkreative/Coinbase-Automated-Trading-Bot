// JavaScript Test Runner for Local CI Verification
const { calculateEMA } = require("../supabase/functions/_shared/indicators/ema");
const { calculateRSI } = require("../supabase/functions/_shared/indicators/rsi");
const { calculatePullback } = require("../supabase/functions/_shared/indicators/pullback");
const { calculateATR } = require("../supabase/functions/_shared/indicators/atr");
const { evaluateSymbol } = require("../supabase/functions/_shared/strategy/strategy");
const { validateTradeRisk } = require("../supabase/functions/_shared/risk/riskManager");

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ TEST FAILED: ${message}`);
    process.exit(1);
  }
}

console.log("🚀 Running All Quant & Strategy Unit Tests...");

// 1. EMA
const prices = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29];
const ema20 = calculateEMA(prices, 20);
assert(ema20.length === 1, "EMA 20 length");
assert(ema20[0] === 19.5, `EMA value: ${ema20[0]}`);

// 2. Pullback
const pb = calculatePullback(95, 100);
assert(pb === -5, `Pullback value: ${pb}`);

// 3. RSI
const rsiCloses = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109, 111, 110, 112, 114, 113, 115];
const rsi = calculateRSI(rsiCloses, 14);
assert(rsi.length > 0 && rsi[0] > 50, "RSI calculation");

// 4. ATR
const mockCandles = Array.from({ length: 20 }, (_, i) => ({
  timestamp: Date.now() - i * 300000,
  open: 100 + i,
  high: 105 + i,
  low: 98 + i,
  close: 103 + i,
  volume: 10,
}));
const atr = calculateATR(mockCandles, 14);
assert(atr > 0, "ATR calculation");

// 5. Strategy Evaluation
const candles = Array.from({ length: 60 }, (_, i) => ({
  timestamp: Date.now() - (60 - i) * 300000,
  open: 50000 + i * 100 - 20,
  high: 50000 + i * 100 + 50,
  low: 50000 + i * 100 - 30,
  close: 50000 + i * 100,
  volume: 100,
}));

const evalResult = evaluateSymbol("BTC-USD", candles, candles, {
  emaFast: 20,
  emaSlow: 50,
  rsiPeriod: 14,
  rsiMin: 35,
  rsiMax: 80,
  pullbackMin: 0,
  pullbackMax: 10,
  signalScoreMinimum: 50,
});
assert(typeof evalResult.shouldTrade === "boolean", "Strategy result boolean");

// 6. Risk Engine
const riskCheck = validateTradeRisk({
  symbol: "BTC-USD",
  settings: {
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
  },
  state: {
    userId: "test-user",
    status: "RUNNING",
    currentBalance: 1000,
    availableBalance: 600,
    reservedBalance: 400,
    totalExposure: 0,
    peakBalance: 1000,
    currentDrawdownPercent: 0,
  },
  openPositions: [],
  recentClosedTrades: [],
  dailyPnl: 0,
  weeklyPnl: 0,
});
assert(riskCheck.allowed === true, "Risk check allowed");
assert(riskCheck.maxAllowedPositionSize === 150, "Max BTC position size");

console.log("✅ ALL QUANT, STRATEGY AND RISK UNIT TESTS PASSED SUCCESSFULLY!");
