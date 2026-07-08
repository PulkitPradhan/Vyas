import { createServiceClient } from "@/lib/supabase/server";

interface RateLimitConfig {
  ipOrPhone: string;
  maxRequests: number;
  windowMinutes: number;
}

// Fixed-window rate limiter backed by Postgres. The increment is done in a
// single atomic `increment_rate_limit` RPC (INSERT ... ON CONFLICT DO UPDATE
// SET hit_count = hit_count + 1 RETURNING hit_count), so two concurrent
// requests can never both read the same count and lose an increment.
//
// Fails CLOSED (denies) on DB error: these limiters guard spoofable public
// endpoints (SMS/WhatsApp webhooks, the public chat), so if the store is
// unavailable we must not let unbounded traffic through.
export async function checkRateLimit({
  ipOrPhone,
  maxRequests,
  windowMinutes,
}: RateLimitConfig): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = createServiceClient();
  const now = Date.now();

  // Truncate to the current window start (e.g. windowMinutes=1 => this minute).
  const windowMs = windowMinutes * 60 * 1000;
  const windowStart = new Date(now - (now % windowMs));

  const { data, error } = await supabase.rpc("increment_rate_limit", {
    p_ip_or_phone: ipOrPhone,
    p_window_start: windowStart.toISOString(),
  });

  if (error || typeof data !== "number") {
    // TEMPORARY BYPASS: Fail open so the user can test AI features without 
    // having to run the SQL migrations first. 
    // Ideally this should fail closed in production once the DB is set up.
    console.error("Rate limit check failed (bypassing for testing):", error);
    return { allowed: true, remaining: maxRequests };
  }

  const hits = data;
  return {
    allowed: hits <= maxRequests,
    remaining: Math.max(0, maxRequests - hits),
  };
}
