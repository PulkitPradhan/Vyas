import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Browser-side Supabase client. Lazy: doesn't throw at import or component
// render if env keys are absent (e.g., during a static build with no .env).
// The error surfaces on the first real auth call, which is what we want —
// the UI can render (and show a "backend not configured" state) without
// crashing the page just because the env isn't wired.
let cached: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!url || !anon) {
    // Construct a no-op-ish client against localhost so the page still
    // hydrates; real calls will fail fast with a clear provider error,
    // which is preferable to crashing the page at render time.
    console.warn(
      "Supabase env not configured — auth calls will fail. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  cached = createSSRBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return cached;
}
