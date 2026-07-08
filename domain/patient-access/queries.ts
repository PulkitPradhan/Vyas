// Patient Access bounded context (Phase 11, ADR-008). READ-ONLY, anonymous,
// no login. The browser hits Supabase directly with the anon key; RLS grants
// anon SELECT on exactly the public-readable fields (facilities, stock_items,
// bed_status, test_availability) per Phase 1. No staff/admin rows are exposed.

export interface PatientFacility {
  id: string;
  name: string;
  type: "PHC" | "CHC";
  district: string;
  block: string;
  lat: number;
  lng: number;
}

export interface PatientStockItem {
  item_name: string;
  quantity: number;
  unit: string;
}

export interface PatientBedStatus {
  total: number;
  occupied: number;
  available: number;
}

export interface PatientTestStatus {
  test_name: string;
  is_functional: boolean;
}

// Server-side initial reads for the public page (so the first paint is real,
// not a spinner — important since the patient has no account and poor signal).
// These use the anon, no-auth server client; RLS still grants the public read.

import { createServerClient } from "@/lib/supabase/server";

export async function listFacilities(): Promise<PatientFacility[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("facilities")
    .select("id, name, type, district, block, lat, lng")
    .order("name");
  return (data ?? []) as PatientFacility[];
}

export async function getFacilityAvailability(facilityId: string): Promise<{
  stock: PatientStockItem[];
  beds: PatientBedStatus | null;
  tests: PatientTestStatus[];
}> {
  const supabase = await createServerClient();

  const [stockRes, bedRes, testRes] = await Promise.all([
    supabase.from("stock_items").select("item_name, quantity, unit").eq("facility_id", facilityId),
    supabase.from("bed_status").select("total, occupied").eq("facility_id", facilityId).maybeSingle(),
    supabase.from("test_availability").select("test_name, is_functional").eq("facility_id", facilityId),
  ]);

  const beds = bedRes.data
    ? {
        total: bedRes.data.total as number,
        occupied: bedRes.data.occupied as number,
        available: (bedRes.data.total as number) - (bedRes.data.occupied as number),
      }
    : null;

  return {
    stock: (stockRes.data ?? []) as PatientStockItem[],
    beds,
    tests: (testRes.data ?? []) as PatientTestStatus[],
  };
}
