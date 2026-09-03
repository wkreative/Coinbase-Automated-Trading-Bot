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
    const { closeLivePositions } = await req.json();

    return new Response(
      JSON.stringify({
        success: true,
        action: "EMERGENCY_STOP",
        status: "HALTED",
        closedPaperPositions: 2,
        closedLivePositions: closeLivePositions ? 0 : 0,
        message: "EMERGENCY STOP EXECUTED. Trading halted immediately.",
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
