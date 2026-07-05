import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { routeForRole } from "@/lib/auth/context";
// Called by the client after a successful Supabase Auth OTP verification
// (the session cookie is now set). We resolve the staff row to decide the
// redirect destination, or signal "not registered" so the UI shows that
// state instead of dumping the user into a blank staff page.
//
// POST only — never GET, so this endpoint never does a redirect itself (the
// client owns the navigation to avoid confusing middleware/route matching).
export async function POST() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, reason: "unknown" }, { status: 401 });
  }

  const { data: staff } = await supabase
    .from("staff")
    .select("role, name")
    .eq("user_id", user.id)
    .single();

  if (!staff) {
    // Auth succeeded but no staff row => not registered for MediServ.
    return NextResponse.json({ ok: false, reason: "not_registered" });
  }

  return NextResponse.json({
    ok: true,
    redirectTo: routeForRole(staff.role as "nurse" | "pharmacist" | "doctor" | "admin"),
    name: staff.name as string,
  });
}

export async function GET() {
  return NextResponse.json({ ok: false, reason: "unknown" }, { status: 405 });
}
