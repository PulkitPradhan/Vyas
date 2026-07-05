import { listFacilities, getFacilityAvailability } from "@/domain/patient-access/queries";
import type { PatientStockItem, PatientBedStatus, PatientTestStatus } from "@/domain/patient-access/queries";
import PatientLookupClient from "@/components/public/PatientLookupClient";

export const dynamic = "force-dynamic";

export default async function PublicPage() {
  const facilities = await listFacilities();
  const initialFacility = facilities[0];
  let initialAvailability: {
    stock: PatientStockItem[];
    beds: PatientBedStatus | null;
    tests: PatientTestStatus[];
  } = { stock: [], beds: null, tests: [] };
  if (initialFacility) {
    initialAvailability = await getFacilityAvailability(initialFacility.id);
  }

  return (
    <PatientLookupClient
      facilities={facilities}
      initialFacilityId={initialFacility?.id ?? null}
      initialAvailability={initialAvailability}
    />
  );
}
