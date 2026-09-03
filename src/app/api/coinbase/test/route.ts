import { NextResponse } from "next/server";
import { testCoinbaseConnectionServer } from "@/lib/services/coinbase";

export async function GET() {
  try {
    const status = await testCoinbaseConnectionServer();
    return NextResponse.json(status);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to test Coinbase API connection" },
      { status: 500 }
    );
  }
}
