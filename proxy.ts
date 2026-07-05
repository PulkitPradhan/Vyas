import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase";

// Per BUILD.md Phase 2: protect /staff, /doctor, /admin. Explicitly exclude
// /(public) routes (ADR-008) and /login — patient lookup must never see an
// auth prompt, even accidentally via shared layout/proxy logic.
//
// The matcher only runs the proxy on these specific path prefixes so the
// service worker, static assets, and reads of /login & /public are never
// gated. Refreshing the Supabase session happens only on protected routes —
// public/anon routes never touch auth, which is the strongest guarantee that
// /public stays login-free.
//
// Renamed from middleware.ts in the Next.js 16 upgrade (the "middleware" file
// convention was renamed to "proxy"; the export follows suit).

const PROTECTED = ["/staff", "/doctor", "/admin"];

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createMiddlewareClient(
    () => request.cookies.getAll(),
    (cookiesToSet) => {
      cookiesToSet.forEach(({ name, value }) => {
        request.cookies.set(name, value);
        response.cookies.set(name, value);
      });
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED.some(
    (p) => path === p || path.startsWith(`${p}/`)
  );

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/staff/:path*", "/doctor/:path*", "/admin/:path*"],
};
