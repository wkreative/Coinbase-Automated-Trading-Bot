import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function GET() {
  try {
    const supabase = getAdminSupabase();

    if (!supabase) {
      return NextResponse.json({
        isConfigured: false,
        message: "Supabase DB credentials not set or using placeholders. Operating in Local Storage mode.",
      });
    }

    // Fetch bot_settings
    const { data: settingsData } = await supabase
      .from("bot_settings")
      .select("*")
      .eq("user_id", DEFAULT_USER_ID)
      .maybeSingle();

    // Fetch bot_state
    const { data: stateData } = await supabase
      .from("bot_state")
      .select("*")
      .eq("user_id", DEFAULT_USER_ID)
      .maybeSingle();

    // Fetch open positions
    const { data: openPositionsData } = await supabase
      .from("positions")
      .select("*")
      .eq("user_id", DEFAULT_USER_ID)
      .eq("status", "OPEN")
      .order("opened_at", { ascending: false });

    // Fetch closed positions (closed trades)
    const { data: closedTradesData } = await supabase
      .from("positions")
      .select("*")
      .eq("user_id", DEFAULT_USER_ID)
      .eq("status", "CLOSED")
      .order("closed_at", { ascending: false })
      .limit(100);

    // Fetch signals
    const { data: signalsData } = await supabase
      .from("signals")
      .select("*")
      .eq("user_id", DEFAULT_USER_ID)
      .order("created_at", { ascending: false })
      .limit(50);

    // Fetch bot_logs
    const { data: logsData } = await supabase
      .from("bot_logs")
      .select("*")
      .eq("user_id", DEFAULT_USER_ID)
      .order("created_at", { ascending: false })
      .limit(100);

    return NextResponse.json({
      isConfigured: true,
      settings: settingsData || null,
      state: stateData || null,
      openPositions: openPositionsData || [],
      closedTrades: closedTradesData || [],
      signals: signalsData || [],
      logs: logsData || [],
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { isConfigured: false, error: err.message || "Failed to sync trading state" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getAdminSupabase();
    if (!supabase) {
      return NextResponse.json({
        isConfigured: false,
        message: "Supabase DB credentials not set. Action saved in local session.",
      });
    }

    const body = await req.json();
    const { action, payload } = body;

    if (action === "SYNC_STATE") {
      const { state, settings } = payload;
      if (state) {
        await supabase.from("bot_state").upsert({
          user_id: DEFAULT_USER_ID,
          status: state.status,
          current_balance: state.currentBalance,
          available_balance: state.availableBalance,
          reserved_balance: state.reservedBalance,
          total_exposure: state.totalExposure,
          peak_balance: state.peakBalance,
          current_drawdown_percent: state.currentDrawdownPercent,
          last_run_at: state.lastRunAt,
          updated_at: new Date().toISOString(),
        });
      }
      if (settings) {
        await supabase.from("bot_settings").upsert({
          user_id: DEFAULT_USER_ID,
          trading_mode: settings.tradingMode,
          bot_enabled: settings.botEnabled,
          live_trading_enabled: settings.liveTradingEnabled,
          starting_capital: settings.startingCapital,
          reserved_capital: settings.reservedCapital,
          max_trading_capital: settings.maxTradingCapital,
          max_total_exposure: settings.maxTotalExposure,
          max_open_positions: settings.maxOpenPositions,
          take_profit_percent: settings.takeProfitPercent,
          stop_loss_percent: settings.stopLossPercent,
          daily_loss_limit: settings.dailyLossLimit,
          weekly_loss_limit: settings.weeklyLossLimit,
          max_drawdown_percent: settings.maxDrawdownPercent,
          updated_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ isConfigured: true, success: true });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to save state to Supabase" },
      { status: 500 }
    );
  }
}
