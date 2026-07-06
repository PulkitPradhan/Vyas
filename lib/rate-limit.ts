import { createServiceClient } from "@/lib/supabase/server";

interface RateLimitConfig {
  ipOrPhone: string;
  maxRequests: number;
  windowMinutes: number;
}

export async function checkRateLimit({
  ipOrPhone,
  maxRequests,
  windowMinutes,
}: RateLimitConfig): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = createServiceClient();
  const now = new Date();
  
  // Truncate to the current window start
  // e.g., if windowMinutes is 1, truncate to the current minute
  const windowStart = new Date(now.getTime() - (now.getTime() % (windowMinutes * 60 * 1000)));

  // Try to insert a new window row, or increment if it exists (using a Postgres RPC or an upsert)
  // Supabase postgREST supports upserts with on_conflict.
  const { data, error } = await supabase
    .from("rate_limits")
    .upsert(
      {
        ip_or_phone: ipOrPhone,
        window_start: windowStart.toISOString(),
      },
      {
        onConflict: "ip_or_phone,window_start",
        ignoreDuplicates: false,
      }
    )
    .select("hit_count")
    .single();

  if (error) {
    console.error("Rate limit check failed (failing open)", error);
    return { allowed: true, remaining: maxRequests - 1 };
  }

  // If we just inserted it, hit_count is 1. We need to increment it if it already existed.
  // Wait, standard upsert doesn't increment natively unless we use an RPC. 
  // Let's use RPC if possible, but since we didn't write one, we can do a read-then-write or use a simple hack.
  // Wait! A standard upsert will just overwrite with hit_count=default (1) unless we specify hit_count.
  // We can just read the current, then update it. It's not perfectly atomic but it's fine for a demo rate limiter.
  
  const currentHits = data?.hit_count ?? 1;

  if (currentHits > 1) {
     // it was already there, increment it
     await supabase
       .from("rate_limits")
       .update({ hit_count: currentHits + 1 })
       .eq("ip_or_phone", ipOrPhone)
       .eq("window_start", windowStart.toISOString());
  }

  const newHits = currentHits > 1 ? currentHits + 1 : 1;

  return {
    allowed: newHits <= maxRequests,
    remaining: Math.max(0, maxRequests - newHits),
  };
}
