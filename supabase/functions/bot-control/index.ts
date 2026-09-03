import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, tradingMode } = await req.json();

    if (!["START", "PAUSE", "STOP", "HALT", "SWITCH_MODE"].includes(action)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid control action" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (action === "SWITCH_MODE" && tradingMode === "LIVE") {
      const isLiveAllowed =
        Deno.env.get("TRADING_MODE") === "LIVE" &&
        Deno.env.get("LIVE_TRADING_ENABLED") === "true";

      if (!isLiveAllowed) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "LIVE Trading is not enabled in server environment variables (TRADING_MODE=LIVE and LIVE_TRADING_ENABLED=true).",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        action,
        newStatus: action === "START" ? "RUNNING" : action === "PAUSE" ? "PAUSED" : action === "HALTED" ? "HALTED" : "STOPPED",
        message: `Bot control action '${action}' executed successfully.`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err) {
    const error = err as Error;
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
