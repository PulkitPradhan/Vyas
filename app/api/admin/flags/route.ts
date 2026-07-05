import { NextResponse } from "next/server";
import { getDistrictFlags } from "@/domain/admin/queries";

// POST-only helper the dashboard's realtime subscription calls on a `flags`
// table change to re-sync the full ordered list (the row-level payload from
// Supabase Realtime doesn't carry joined facility names, so a uniform re-fetch
// keeps the dashboard coherent).
export async function POST() {
  const flags = await getDistrictFlags();
  return NextResponse.json({ flags });
}

export async function GET() {
  return NextResponse.json({ flags: [] }, { status: 405 });
}
