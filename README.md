# 🤖 Coinbase Automated Trading Bot

An enterprise-grade, automated quantitative trading platform connected to **Coinbase Advanced Trade API**. Built with Next.js, Supabase PostgreSQL, Deno Edge Functions, and Tailwind CSS.

---

## ⚡ Key Features

* **Strict Paper Trading Default**: Bootstraps with **$1,000 simulated capital**. `TRADING_MODE=PAPER` and `LIVE_TRADING_ENABLED=false` by default.
* **Double-Lock Safety Mechanism**: Live trading requires simultaneous server environment flags (`TRADING_MODE=LIVE` AND `LIVE_TRADING_ENABLED=true`) plus an 8-step safety confirmation in the dashboard.
* **Risk Engine & Circuit Breakers**:
  * 2 consecutive losing trades => 12h pause.
  * 3 losing trades in 24 hours => 24h pause.
  * Daily Loss limit ($15) & Weekly Loss limit ($40).
  * Maximum Drawdown limit (10%) => **HALT** state requiring manual reactivation.
* **General Market Filter**: BTC 4h drop > 4% triggers **RISK_OFF** state, preventing new entries across BTC, ETH, and SOL.
* **Quantitative 5M Strategy Engine**: EMA 20 > 50 trend, -2% to -4.5% pullback, RSI 35-48, bullish recovery candle, and Signal Score >= 75/100.
* **Advisory Locks & Idempotency**: PostgreSQL advisory locks avoid race conditions; deterministic `client_order_id` prevents duplicate order submissions.

---

## 🏗️ Architecture

```
/src
  /app
    /login                -> Auth login page
    /dashboard            -> Main overview fintech dashboard
    /dashboard/trades     -> Completed audited trades history
    /dashboard/signals    -> Evaluated strategy signals audit log
    /dashboard/logs       -> Real-time system console logs
    /dashboard/settings   -> Interactive strategy parameters & risk limits
  /components/dashboard   -> Reusable Glassmorphism UI components & charts
  /lib/trading            -> Core paper trading simulator & state store

/supabase
  /functions
    /_shared              -> Shared Coinbase API, Quant Indicators, Strategy & Risk Engines
    /trading-engine       -> Idempotent 5-minute trading cycle Edge Function
    /bot-control          -> Start, Pause, Stop, Halt controller
    /emergency-stop       -> Immediate emergency liquidator
  /migrations             -> PostgreSQL schema migrations & seed scripts
```

---

## 🚀 Quick Start (Local Development)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

3. **Run Unit Tests**:
   ```bash
   npx ts-node tests/indicators.test.ts
   npx ts-node tests/strategy.test.ts
   npx ts-node tests/riskManager.test.ts
   ```

4. **Launch Local Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 🛡️ Financial Risk Disclaimer

Automated trading involves financial risk. Past or simulated performance does not guarantee future results. Never trade with money you cannot afford to lose.
