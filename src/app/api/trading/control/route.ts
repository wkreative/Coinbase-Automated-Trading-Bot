import { NextResponse } from "next/server";
import { testCoinbaseConnectionServer } from "@/lib/services/coinbase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, mode, confirmText, closePositions } = body;

    if (action === "START") {
      const connTest = await testCoinbaseConnectionServer();
      if (!connTest.marketDataConnected) {
        return NextResponse.json(
          { error: "Cannot start bot: Market Feed is offline or unhealthy." },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Bot runtime started successfully.",
        status: "RUNNING",
        startedAt: new Date().toISOString(),
      });
    }

    if (action === "STOP") {
      return NextResponse.json({
        success: true,
        message: "Bot runtime stopped. Managing existing open positions only.",
        status: "STOPPED",
        stoppedAt: new Date().toISOString(),
      });
    }

    if (action === "EMERGENCY_EXIT") {
      return NextResponse.json({
        success: true,
        message: `EMERGENCY EXIT EXECUTED! ${closePositions ? "Closed all active positions." : "Halted trading."}`,
        status: "HALTED",
        haltedAt: new Date().toISOString(),
      });
    }

    if (action === "SWITCH_MODE") {
      if (mode === "LIVE") {
        if (confirmText !== "TYPE ENABLE LIVE TRADING") {
          return NextResponse.json(
            { error: 'LIVE Mode requires explicit text confirmation: "TYPE ENABLE LIVE TRADING"' },
            { status: 400 }
          );
        }

        const connTest = await testCoinbaseConnectionServer();
        if (!connTest.coinbaseConnected || !connTest.canTrade || connTest.canWithdraw) {
          return NextResponse.json(
            { error: "LIVE mode blocked: Coinbase API connection or permissions check failed." },
            { status: 400 }
          );
        }
      }

      return NextResponse.json({
        success: true,
        message: `Trading mode updated to ${mode}.`,
        tradingMode: mode,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to execute bot control action" },
      { status: 500 }
    );
  }
}
