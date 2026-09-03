# 🚀 Production Deployment Guide

Follow these exact steps to deploy the Coinbase Automated Trading Bot to **Supabase** and **Vercel**.

---

## 1. Supabase Setup & Database Push

1. **Login to Supabase CLI**:
   ```bash
   npx supabase login
   ```

2. **Link your Supabase Project**:
   ```bash
   npx supabase link --project-ref <your-supabase-project-ref>
   ```

3. **Push Database Schema & Migrations**:
   ```bash
   npx supabase db push
   ```

---

## 2. Deploy Supabase Edge Functions & Secrets

1. **Set Edge Function Environment Secrets**:
   ```bash
   npx supabase secrets set COINBASE_API_KEY="your-coinbase-api-key"
   npx supabase secrets set COINBASE_API_SECRET="your-coinbase-private-key-pem"
   npx supabase secrets set TRADING_MODE="PAPER"
   npx supabase secrets set LIVE_TRADING_ENABLED="false"
   npx supabase secrets set BOT_CRON_SECRET="your-secure-cron-secret-key"
   ```

2. **Deploy Edge Functions**:
   ```bash
   npx supabase functions deploy trading-engine
   npx supabase functions deploy bot-control
   npx supabase functions deploy emergency-stop
   ```

3. **Configure Supabase Cron (`pg_cron`)**:
   Execute the following SQL in your Supabase SQL Editor to trigger `trading-engine` every 5 minutes:

   ```sql
   SELECT cron.schedule(
     'trading-engine-5m',
     '*/5 * * * *',
     $$
     SELECT net.http_post(
       url:='https://<your-project-ref>.supabase.co/functions/v1/trading-engine',
       headers:='{"Content-Type": "application/json", "Authorization": "Bearer your-secure-cron-secret-key"}'::jsonb,
       body:='{}'::jsonb
     ) as request_id;
     $$
   );
   ```

---

## 3. Vercel Frontend Deployment

1. **Deploy via Vercel CLI**:
   ```bash
   npx vercel
   ```

2. **Add Environment Variables in Vercel Project Settings**:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   * `SUPABASE_SERVICE_ROLE_KEY`
   * `TRADING_MODE` = `PAPER`
   * `LIVE_TRADING_ENABLED` = `false`

3. **Deploy to Production**:
   ```bash
   npx vercel --prod
   ```
