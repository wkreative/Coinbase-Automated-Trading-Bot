-- Migration: 20260903000002_audit_schema_update.sql
-- Description: Complete schema additions for Coinbase Trading Bot Audit

-- 1. Bot Runtime Table (Persists worker heartbeat & state across restarts)
CREATE TABLE IF NOT EXISTS public.bot_runtime (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  trading_mode trading_mode NOT NULL DEFAULT 'PAPER',
  status bot_status NOT NULL DEFAULT 'STOPPED',
  last_heartbeat TIMESTAMPTZ,
  last_cycle TIMESTAMPTZ,
  current_error TEXT,
  started_at TIMESTAMPTZ,
  stopped_at TIMESTAMPTZ,
  strategy_version TEXT NOT NULL DEFAULT 'v1.0.0',
  consecutive_losses INT NOT NULL DEFAULT 0,
  pause_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_runtime UNIQUE(user_id)
);

-- 2. Real Market Candles Table
CREATE TABLE IF NOT EXISTS public.market_candles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  granularity TEXT NOT NULL DEFAULT '5m',
  open NUMERIC(16, 6) NOT NULL,
  high NUMERIC(16, 6) NOT NULL,
  low NUMERIC(16, 6) NOT NULL,
  close NUMERIC(16, 6) NOT NULL,
  volume NUMERIC(18, 8) NOT NULL,
  candle_start TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_candle UNIQUE(product_id, granularity, candle_start)
);

-- 3. Calculated Indicators Table
CREATE TABLE IF NOT EXISTS public.indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  candle_start TIMESTAMPTZ NOT NULL,
  ema20 NUMERIC(16, 6) NOT NULL,
  ema50 NUMERIC(16, 6) NOT NULL,
  rsi NUMERIC(8, 4) NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_indicator UNIQUE(product_id, candle_start)
);

-- 4. Order Intents Table (Idempotency check)
CREATE TABLE IF NOT EXISTS public.order_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_order_id TEXT NOT NULL UNIQUE,
  product_id TEXT NOT NULL,
  side TEXT NOT NULL DEFAULT 'BUY',
  size_usd NUMERIC(12, 2) NOT NULL,
  mode trading_mode NOT NULL DEFAULT 'PAPER',
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. API Connection Status Table
CREATE TABLE IF NOT EXISTS public.api_connection_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  coinbase_connected BOOLEAN NOT NULL DEFAULT FALSE,
  market_data_connected BOOLEAN NOT NULL DEFAULT FALSE,
  can_view BOOLEAN NOT NULL DEFAULT FALSE,
  can_trade BOOLEAN NOT NULL DEFAULT FALSE,
  can_withdraw BOOLEAN NOT NULL DEFAULT FALSE,
  usd_balance NUMERIC(12, 2) DEFAULT 0.00,
  latency_ms INT DEFAULT 0,
  last_tested_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_api_status UNIQUE(user_id)
);

-- Add strategy_version & candle_start to signals if not existing
ALTER TABLE public.signals 
  ADD COLUMN IF NOT EXISTS strategy_version TEXT NOT NULL DEFAULT 'v1.0.0',
  ADD COLUMN IF NOT EXISTS candle_start TIMESTAMPTZ;

-- Unique Index for Duplicate Signal Protection (product_id + candle_start + strategy_version)
CREATE UNIQUE INDEX IF NOT EXISTS idx_signals_unique_candle_strategy 
  ON public.signals(symbol, candle_start, strategy_version) 
  WHERE candle_start IS NOT NULL;

-- Enable RLS for new tables
ALTER TABLE public.bot_runtime ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_candles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_connection_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own bot_runtime" ON public.bot_runtime FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public read market_candles" ON public.market_candles FOR SELECT USING (true);
CREATE POLICY "Public read indicators" ON public.indicators FOR SELECT USING (true);
CREATE POLICY "Users can access own order_intents" ON public.order_intents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own api_connection_status" ON public.api_connection_status FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_market_candles_product_start ON public.market_candles(product_id, candle_start DESC);
CREATE INDEX IF NOT EXISTS idx_indicators_product_start ON public.indicators(product_id, candle_start DESC);
