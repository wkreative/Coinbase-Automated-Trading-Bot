-- Migration: 20260903000000_initial_schema.sql
-- Description: Complete schema for Coinbase Automated Trading Bot

-- Create Custom ENUMs
CREATE TYPE trading_mode AS ENUM ('PAPER', 'LIVE');
CREATE TYPE bot_status AS ENUM ('STOPPED', 'RUNNING', 'PAUSED', 'HALTED', 'ERROR');
CREATE TYPE trading_symbol AS ENUM ('BTC-USD', 'ETH-USD', 'SOL-USD');
CREATE TYPE position_status AS ENUM ('PENDING', 'OPEN', 'CLOSING', 'CLOSED', 'FAILED');
CREATE TYPE exit_reason AS ENUM ('TAKE_PROFIT', 'STOP_LOSS', 'MANUAL', 'RISK_MANAGER', 'EMERGENCY', 'ERROR');
CREATE TYPE signal_decision AS ENUM ('BUY', 'REJECT');
CREATE TYPE log_level AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bot Settings Table
CREATE TABLE IF NOT EXISTS public.bot_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trading_mode trading_mode NOT NULL DEFAULT 'PAPER',
  bot_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  live_trading_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  
  starting_capital NUMERIC(12, 2) NOT NULL DEFAULT 1000.00,
  reserved_capital NUMERIC(12, 2) NOT NULL DEFAULT 400.00,
  max_trading_capital NUMERIC(12, 2) NOT NULL DEFAULT 600.00,
  max_total_exposure NUMERIC(12, 2) NOT NULL DEFAULT 300.00,
  max_open_positions INT NOT NULL DEFAULT 2,

  btc_max_position NUMERIC(12, 2) NOT NULL DEFAULT 150.00,
  eth_max_position NUMERIC(12, 2) NOT NULL DEFAULT 125.00,
  sol_max_position NUMERIC(12, 2) NOT NULL DEFAULT 100.00,

  take_profit_percent NUMERIC(5, 2) NOT NULL DEFAULT 4.00,
  stop_loss_percent NUMERIC(5, 2) NOT NULL DEFAULT 2.50,

  daily_loss_limit NUMERIC(12, 2) NOT NULL DEFAULT 15.00,
  weekly_loss_limit NUMERIC(12, 2) NOT NULL DEFAULT 40.00,
  max_drawdown_percent NUMERIC(5, 2) NOT NULL DEFAULT 10.00,

  ema_fast INT NOT NULL DEFAULT 20,
  ema_slow INT NOT NULL DEFAULT 50,
  rsi_period INT NOT NULL DEFAULT 14,
  rsi_min NUMERIC(5, 2) NOT NULL DEFAULT 35.00,
  rsi_max NUMERIC(5, 2) NOT NULL DEFAULT 48.00,

  pullback_min NUMERIC(5, 2) NOT NULL DEFAULT 2.00,
  pullback_max NUMERIC(5, 2) NOT NULL DEFAULT 4.50,

  signal_score_minimum INT NOT NULL DEFAULT 75,
  same_asset_cooldown_minutes INT NOT NULL DEFAULT 60,

  simulated_fee_percent NUMERIC(5, 4) NOT NULL DEFAULT 0.60,
  simulated_slippage_percent NUMERIC(5, 4) NOT NULL DEFAULT 0.10,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_settings UNIQUE(user_id)
);

-- 3. Bot State Table
CREATE TABLE IF NOT EXISTS public.bot_state (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  status bot_status NOT NULL DEFAULT 'STOPPED',
  pause_until TIMESTAMPTZ,
  pause_reason TEXT,

  current_balance NUMERIC(12, 2) NOT NULL DEFAULT 1000.00,
  available_balance NUMERIC(12, 2) NOT NULL DEFAULT 600.00,
  reserved_balance NUMERIC(12, 2) NOT NULL DEFAULT 400.00,

  total_exposure NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  peak_balance NUMERIC(12, 2) NOT NULL DEFAULT 1000.00,
  current_drawdown_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,

  last_run_at TIMESTAMPTZ,
  last_successful_run_at TIMESTAMPTZ,
  last_error TEXT,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Signals Table
CREATE TABLE IF NOT EXISTS public.signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  symbol trading_symbol NOT NULL,
  price NUMERIC(16, 6) NOT NULL,

  ema20 NUMERIC(16, 6),
  ema50 NUMERIC(16, 6),
  rsi NUMERIC(8, 4),
  recent_high NUMERIC(16, 6),
  pullback_percent NUMERIC(8, 4),

  trend_valid BOOLEAN NOT NULL DEFAULT FALSE,
  pullback_valid BOOLEAN NOT NULL DEFAULT FALSE,
  rsi_valid BOOLEAN NOT NULL DEFAULT FALSE,
  confirmation_valid BOOLEAN NOT NULL DEFAULT FALSE,
  market_filter_valid BOOLEAN NOT NULL DEFAULT FALSE,

  trend_score INT NOT NULL DEFAULT 0,
  pullback_score INT NOT NULL DEFAULT 0,
  rsi_score INT NOT NULL DEFAULT 0,
  confirmation_score INT NOT NULL DEFAULT 0,
  market_score INT NOT NULL DEFAULT 0,

  total_score INT NOT NULL DEFAULT 0,
  decision signal_decision NOT NULL,
  rejection_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Positions Table
CREATE TABLE IF NOT EXISTS public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  symbol trading_symbol NOT NULL,
  mode trading_mode NOT NULL,
  side TEXT NOT NULL DEFAULT 'BUY',
  status position_status NOT NULL DEFAULT 'PENDING',

  entry_price NUMERIC(16, 6) NOT NULL,
  quantity NUMERIC(18, 8) NOT NULL,
  quote_amount NUMERIC(12, 2) NOT NULL,

  take_profit_price NUMERIC(16, 6) NOT NULL,
  stop_loss_price NUMERIC(16, 6) NOT NULL,

  entry_fee NUMERIC(12, 4) NOT NULL DEFAULT 0.00,
  exit_fee NUMERIC(12, 4) NOT NULL DEFAULT 0.00,
  slippage NUMERIC(12, 4) NOT NULL DEFAULT 0.00,

  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  exit_price NUMERIC(16, 6),
  exit_reason exit_reason,

  gross_pnl NUMERIC(12, 2) DEFAULT 0.00,
  net_pnl NUMERIC(12, 2) DEFAULT 0.00,
  pnl_percent NUMERIC(8, 4) DEFAULT 0.00,

  signal_id UUID REFERENCES public.signals(id),
  client_order_id TEXT UNIQUE
);

-- 6. Trades Table
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  coinbase_order_id TEXT,
  client_order_id TEXT NOT NULL,
  symbol trading_symbol NOT NULL,
  mode trading_mode NOT NULL,
  side TEXT NOT NULL, -- BUY / SELL
  price NUMERIC(16, 6) NOT NULL,
  quantity NUMERIC(18, 8) NOT NULL,
  fee NUMERIC(12, 4) NOT NULL DEFAULT 0.00,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Daily Stats Table
CREATE TABLE IF NOT EXISTS public.daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_trades INT DEFAULT 0,
  winning_trades INT DEFAULT 0,
  losing_trades INT DEFAULT 0,
  gross_profit NUMERIC(12, 2) DEFAULT 0.00,
  gross_loss NUMERIC(12, 2) DEFAULT 0.00,
  net_pnl NUMERIC(12, 2) DEFAULT 0.00,
  starting_balance NUMERIC(12, 2) DEFAULT 1000.00,
  ending_balance NUMERIC(12, 2) DEFAULT 1000.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_daily DATE UNIQUE(user_id, date)
);

-- 8. Weekly Stats Table
CREATE TABLE IF NOT EXISTS public.weekly_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  year INT NOT NULL,
  week_number INT NOT NULL,
  total_trades INT DEFAULT 0,
  winning_trades INT DEFAULT 0,
  losing_trades INT DEFAULT 0,
  net_pnl NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_weekly UNIQUE(user_id, year, week_number)
);

-- 9. Bot Logs Table
CREATE TABLE IF NOT EXISTS public.bot_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  level log_level NOT NULL DEFAULT 'INFO',
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Risk Events Table
CREATE TABLE IF NOT EXISTS public.risk_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_events ENABLE ROW LEVEL SECURITY;

-- Helper RLS Policies for authenticated users
CREATE POLICY "Users can access own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can access own settings" ON public.bot_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own state" ON public.bot_state FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own signals" ON public.signals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own positions" ON public.positions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own trades" ON public.trades FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own daily_stats" ON public.daily_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own weekly_stats" ON public.weekly_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own bot_logs" ON public.bot_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own risk_events" ON public.risk_events FOR ALL USING (auth.uid() = user_id);

-- Create Indexes for Fast Queries
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON public.signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_positions_status ON public.positions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bot_logs_level_created ON public.bot_logs(user_id, level, created_at DESC);
