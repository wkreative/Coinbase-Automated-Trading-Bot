-- Migration: 20260903000001_seed_data.sql
-- Description: Seed initial default user settings and bot state

-- Insert default user profile for local/system administration if none exists
DO $$
DECLARE
  default_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (default_user_id, 'trader@coinbasebot.local', 'Quant Trader')
  ON CONFLICT (id) DO NOTHING;

  -- Seed Default Bot Settings
  INSERT INTO public.bot_settings (
    user_id,
    trading_mode,
    bot_enabled,
    live_trading_enabled,
    starting_capital,
    reserved_capital,
    max_trading_capital,
    max_total_exposure,
    max_open_positions,
    btc_max_position,
    eth_max_position,
    sol_max_position,
    take_profit_percent,
    stop_loss_percent,
    daily_loss_limit,
    weekly_loss_limit,
    max_drawdown_percent,
    ema_fast,
    ema_slow,
    rsi_period,
    rsi_min,
    rsi_max,
    pullback_min,
    pullback_max,
    signal_score_minimum,
    same_asset_cooldown_minutes,
    simulated_fee_percent,
    simulated_slippage_percent
  )
  VALUES (
    default_user_id,
    'PAPER',
    FALSE,
    FALSE,
    1000.00,
    400.00,
    600.00,
    300.00,
    2,
    150.00,
    125.00,
    100.00,
    4.00,
    2.50,
    15.00,
    40.00,
    10.00,
    20,
    50,
    14,
    35.00,
    48.00,
    2.00,
    4.50,
    75,
    60,
    0.60,
    0.10
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Seed Initial Bot State
  INSERT INTO public.bot_state (
    user_id,
    status,
    current_balance,
    available_balance,
    reserved_balance,
    total_exposure,
    peak_balance,
    current_drawdown_percent
  )
  VALUES (
    default_user_id,
    'STOPPED',
    1000.00,
    600.00,
    400.00,
    0.00,
    1000.00,
    0.00
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Seed Initial Log
  INSERT INTO public.bot_logs (user_id, level, category, message, metadata)
  VALUES (
    default_user_id,
    'INFO',
    'SYSTEM',
    'Bot initialized with default configuration: $1,000 capital in PAPER mode.',
    '{"mode": "PAPER", "initial_capital": 1000}'::jsonb
  );

END $$;
