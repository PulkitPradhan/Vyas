import { NextResponse } from "next/server";
import { getFacilityAvailability } from "@/domain/patient-access/queries";

// Anon-friendly availability fetch for the patient lookup's on-selection
// re-query. Reuses the same read paths as the RLS-granted public reads; no
// auth check anywhere.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { facilityId?: string };
  if (!body.facilityId) {
    return NextResponse.json({ error: "facilityId required" }, { status: 400 });
  }
  const availability = await getFacilityAvailability(body.facilityId);
  return NextResponse.json(availability);
}
