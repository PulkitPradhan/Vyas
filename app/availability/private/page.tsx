import FacilityClient from "@/components/public/FacilityClient";
import { DEMO_PRIVATE } from "@/data/private";

export const dynamic = "force-dynamic";

export default function PrivateAvailabilityPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-6">
      <div className="mb-6 max-w-3xl mx-auto ms-fade-rise">
        <h1 className="text-section font-bold text-ms-textPrimary tracking-tight">
          Private Health Centres
        </h1>
        <p className="mt-1 text-sm text-ms-textSecondary">
          Live availability and insights for private multi-speciality hospitals in Faridabad.
        </p>
      </div>
      <FacilityClient facilityType="Private" facilities={DEMO_PRIVATE} />
    </main>
  );
}
