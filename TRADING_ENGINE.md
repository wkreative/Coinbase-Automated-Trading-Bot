# 📈 Trading Engine & Indicator Specification

## 1. Supported Trading Products & Timeframe
- **Products**: `BTC-USD`, `ETH-USD`, `SOL-USD`.
- **Timeframe**: `5 minutes` (5M).
- **Rule**: Strategy evaluates **ONLY CLOSED CANDLES** (`candle_start + 5m <= now`). Incomplete open 5m candles are excluded.

## 2. Technical Indicators
- **EMA 20 (Exponential Moving Average 20)**: Fast trend indicator.
- **EMA 50 (Exponential Moving Average 50)**: Slow trend baseline.
- **RSI 14 (Relative Strength Index 14)**: Momentum oscillator using Wilder's smoothing.
- **Pullback Calculation**: % distance from 2-hour recent high.

## 3. Signal Engine Scoring (0 - 100)
- **Minimum Score Threshold**: `75 / 100`.
- **Criteria Rules**:
  1. `EMA20 > EMA50` (Bullish Trend): +25 points.
  2. `Pullback` between -2.0% and -4.5%: +25 points.
  3. `RSI` between 35 and 48: +20 points.
  4. `Green Recovery Candle Confirmation`: +15 points.
  5. `BTC General Market Filter`: +15 points.

## 4. Risk Engine Controls & Circuit Breakers
- **Defaults**:
  - Starting Paper Capital: `$1,000`
  - Max Position Size: `$200`
  - Max Open Positions: `2`
  - Max Capital Deployed: `$400`
  - Daily Loss Limit: `3%`
  - Weekly Loss Limit: `6%`
  - Max Drawdown Limit: `10%`
  - Consecutive Loss Limit: `3 losses => 6-hour pause`
  - Take Profit: `+4.0%`
  - Stop Loss: `-2.5%`

## 5. Duplicate Signal & Order Idempotency
- Unique constraint on `(product_id + candle_start + strategy_version)` prevents multiple entries on the same closed candle.
- Unique `client_order_id` ensures idempotent order execution.
