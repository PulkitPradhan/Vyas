import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceClient();
  
  // Minimal read query to verify DB connectivity
  const { error } = await supabase.from("facilities").select("id").limit(1);

  const status = {
    status: error ? "error" : "ok",
    supabase: error ? "disconnected" : "connected",
    gemini: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "configured" : "missing",
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(status, {
    status: error ? 503 : 200,
  });
}
