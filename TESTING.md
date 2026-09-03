# 🧪 Automated Test Suite Guidelines

## Running the Unit Tests

Execute the unit test suite locally using `npm test`:

```bash
npm test
```

This runs:
1. `tests/indicators.test.ts` (EMA20, EMA50, RSI14, ATR, Pullback calculations).
2. `tests/strategy.test.ts` (Signal scoring rules, trend filters, recovery candles).
3. `tests/riskManager.test.ts` (Drawdown limits, daily/weekly loss circuit breakers, position sizing).
4. `tests/executionAndPnl.test.ts` (Gross vs Net PnL, fees, slippage, market data freshness).

## Safety Rule
Tests NEVER submit real orders to Coinbase API. All order execution during testing uses simulated paper execution adapters.
