# 🛡️ Security Guidelines & Key Management

## 1. Zero Client-Side Credential Exposure
- **Strict Server-Side Only**: Coinbase API Keys (`COINBASE_API_KEY`) and EC Private Secrets (`COINBASE_API_SECRET`) are processed exclusively on the server side (Next.js server API routes & Supabase Edge Functions).
- **No `NEXT_PUBLIC_` Key Leaks**: Private secrets are NEVER exposed to client bundles or environment variables starting with `NEXT_PUBLIC_`.
- **Dashboard API Verification**: The frontend only receives boolean status flags (`coinbaseConnected: true/false`, `canView: true`, `canTrade: true`).

## 2. Coinbase API Permission Scopes
- **Required Permissions**: `View`, `Trade`.
- **Forbidden Permissions**: `Withdraw`, `Transfer`, `Send Crypto`.
- **Security Check**: Connection test automatically checks key scopes and flags any key with withdrawal permissions as unsafe.

## 3. LIVE Mode Double-Lock
- Default mode is strictly **PAPER**.
- Transitioning to **LIVE** mode requires:
  1. Authenticated user session.
  2. Passing Coinbase API connection and permissions check.
  3. Market data freshness check (`data_age_seconds <= 15`).
  4. Typing exact text string: `"TYPE ENABLE LIVE TRADING"`.
  5. Accepting financial risk acknowledgment checkbox.

## 4. RLS & Middleware Security
- All database queries enforce Row Level Security (RLS).
- Middleware protects `/dashboard/*` and `/api/*` endpoints against unauthenticated access.
