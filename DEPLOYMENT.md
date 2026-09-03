# 🚀 Deployment Guide (Vercel & Supabase)

## 1. Environment Configuration

Copy `.env.example` to environment variable settings in Vercel and Supabase:

```ini
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
COINBASE_API_KEY=organizations/org-id/apiKeys/key-id
COINBASE_API_SECRET="-----BEGIN EC PRIVATE KEY-----\n...\n-----END EC PRIVATE KEY-----"
TRADING_MODE=PAPER
LIVE_TRADING_ENABLED=false
```

## 2. Supabase Migration Execution

Run database migrations against your Supabase PostgreSQL instance:

```bash
npx supabase db push
```

Or apply `migrations/20260903000000_initial_schema.sql` and `migrations/20260903000002_audit_schema_update.sql` via Supabase SQL Editor.

## 3. Deploying 24/7 Worker Edge Function

Deploy the background worker to Supabase Edge Functions:

```bash
npx supabase functions deploy trading-engine
```

Schedule cron triggers or ping the edge function every 5 minutes using Supabase `pg_cron` or an external uptime monitor.

## 4. Vercel Deployment

Push repository to GitHub / Vercel:

```bash
git push origin main
```

Vercel automatically builds and deploys the Next.js application.
