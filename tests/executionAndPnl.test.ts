function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function calculateNetPnl(
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  quoteAmount: number,
  entryFeePercent: number,
  exitFeePercent: number,
  slippagePercent: number
) {
  const grossPnl = (exitPrice - entryPrice) * quantity;
  const entryFee = (quoteAmount * entryFeePercent) / 100;
  const exitFee = (quoteAmount * exitFeePercent) / 100;
  const slippage = (quoteAmount * slippagePercent) / 100;
  const netPnl = grossPnl - entryFee - exitFee - slippage;
  return { grossPnl, entryFee, exitFee, slippage, netPnl };
}

function checkDataFreshness(lastTimestampMs: number, nowMs: number, maxAgeSec = 15): boolean {
  const ageSec = Math.floor((nowMs - lastTimestampMs) / 1000);
  return ageSec <= maxAgeSec;
}

function runTests() {
  console.log("🧪 Running Execution & Net PnL Unit Tests...");

  // 1. Net PnL Test with Fees and Slippage
  const pnlResult = calculateNetPnl(100, 104, 2, 200, 0.6, 0.6, 0.1);
  // Gross PnL = (104 - 100) * 2 = 8.00 USD
  // Entry Fee = 200 * 0.006 = 1.20 USD
  // Exit Fee = 200 * 0.006 = 1.20 USD
  // Slippage = 200 * 0.001 = 0.20 USD
  // Net PnL = 8.00 - 1.20 - 1.20 - 0.20 = 5.40 USD
  assert(pnlResult.grossPnl === 8, `Gross PnL should be 8.00, got ${pnlResult.grossPnl}`);
  assert(Math.abs(pnlResult.netPnl - 5.4) < 0.001, `Net PnL should be 5.40, got ${pnlResult.netPnl}`);

  // 2. Data Freshness Test
  const now = 1700000000000;
  assert(checkDataFreshness(now - 10000, now, 15) === true, "Data 10s old should be fresh");
  assert(checkDataFreshness(now - 20000, now, 15) === false, "Data 20s old should be stale");

  console.log("✅ Execution & Net PnL Unit Tests Passed!");
}

runTests();
