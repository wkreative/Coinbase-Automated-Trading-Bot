# 🏗️ System Architecture & Data Flow

This document details the architectural design of the **Coinbase Automated Trading Bot**.

## 1. High-Level Data Flow Pipeline

```
  +-------------------------------------------------------------+
  |              Coinbase Advanced Trade REST API               |
  +-------------------------------------------------------------+
                                |
                                | Closed 5M Candles & Market Data
                                v
  +-------------------------------------------------------------+
  |               Market Data & Indicator Engine                |
  |              (Calculates EMA20, EMA50, RSI14)               |
  +-------------------------------------------------------------+
                                |
                                | Calculated Metrics
                                v
  +-------------------------------------------------------------+
  |                       Strategy Engine                       |
  |               (Evaluates rules & Score 0-100)               |
  +-------------------------------------------------------------+
                                |
                                | Score >= 75 Signal
                                v
  +-------------------------------------------------------------+
  |                         Risk Engine                         |
  |         (Checks Balance, Exposure, Losses & Drawdown)        |
  +-------------------------------------------------------------+
                                |
                                | Approved OrderIntent
                                v
  +-------------------------------------------------------------+
  |                      Execution Adapter                      |
  |     PAPER Execution Adapter  |  LIVE Coinbase API Adapter   |
  +-------------------------------------------------------------+
                                |
                                v
  +-------------------------------------------------------------+
  |               Supabase PostgreSQL Persistence               |
  |    (bot_runtime, candles, signals, orders, trades, logs)    |
  +-------------------------------------------------------------+
```

## 2. Component Layer Responsibilities

* **Frontend Dashboard (Next.js 16)**: High-performance fintech dashboard for visual monitoring, setting rules, viewing signals, trades, logs, and controlling runtime state (`START`, `STOP`, `EMERGENCY EXIT`).
* **Server API Layer (`/api/trading/*`, `/api/coinbase/*`)**: Server-side API endpoints handling Coinbase connection verification, system health, and secure execution without leaking credentials.
* **Worker & Edge Runtime (`supabase/functions/trading-engine`)**: Independent 24/7 background worker running evaluation loops, heartbeats, and order execution without requiring browser activity.
* **Database Layer (`Supabase PostgreSQL`)**: Persists real candles, indicators, order intents, trades, risk events, and bot runtime heartbeats.
