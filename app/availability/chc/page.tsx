import FacilityClient from "@/components/public/FacilityClient";
import { DEMO_CHCS } from "@/data/chc";

export const dynamic = "force-dynamic";

export default function ChcAvailabilityPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-6">
      <div className="mb-6 max-w-3xl mx-auto ms-fade-rise">
        <h1 className="text-section font-bold text-ms-textPrimary tracking-tight">
          Community Health Centres
        </h1>
        <p className="mt-1 text-sm text-ms-textSecondary">
          Live availability and insights for government CHCs in Faridabad.
        </p>
      </div>
      <FacilityClient facilityType="CHC" facilities={DEMO_CHCS} />
    </main>
  );
}
