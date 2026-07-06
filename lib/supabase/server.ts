import { cookies } from "next/headers";
import {
  createServerClient as createSSRClient,
  createBrowserClient,
} from "@supabase/ssr";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anon = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Server-side Supabase client for use in Server Components, Server Actions,
// and route handlers. Reads + writes the auth session via Next cookies.
// Lazy + non-throwing on missing env so build-time prerender of protected
// layouts doesn't crash; an actual auth/db call will surface the error.
//
// IMPORTANT: a fresh client is built on every call. `cookies()` is per-request,
// and in a serverless/warm-container environment a module-level cache would
// bleak the first request's cookie store (and therefore its auth session) into
// every subsequent request. `cookies()` is cheap, so there is nothing to cache.
export async function createServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createSSRClient(url(), anon(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as object)
          );
        } catch {
          // Called from a Server Component where cookies can't mutate — the
          // middleware refresh handles persistence on the next request.
        }
      },
    },
  });
}

// Middleware variant: build a server client from the middleware's request
// cookie store (`request.cookies`), mirroring the Supabase-recommended pattern
// so the session can be refreshed through middleware before reaching layouts.
export function createMiddlewareClient(
  getAll: () => { name: string; value: string }[],
  setAll: (
    cookiesToSet: { name: string; value: string; options?: object }[]
  ) => void
): SupabaseClient {
  return createSSRClient(url(), anon(), { cookies: { getAll, setAll } });
}

// Service-role client for trusted server paths only (the AI module, the SMS
// webhook, the cron report). NEVER expose the service-role key to the browser;
// never import from a client component.
export function createServiceClient(): SupabaseClient {
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceUrl || !serviceKey) {
    throw new Error(
      "Service client misconfigured: SUPABASE_SERVICE_ROLE_KEY must be set on the server"
    );
  }
  return createSupabaseClient(serviceUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export { createBrowserClient };
