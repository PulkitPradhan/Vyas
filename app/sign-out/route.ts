import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// GET-friendly sign-out (link-triggered): clears the server session and
// returns to the app origin, not the Supabase backend. Uses the request's
// own origin so it works on localhost and Vercel equally.
export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  await supabase.auth.signOut();

  const home = new URL("/", request.nextUrl.origin);
  const res = NextResponse.redirect(home);
  return res;
}
