import CategoryCard from "@/components/public/CategoryCard";

export default function AvailabilityPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-6">
      <div className="mb-10 max-w-3xl mx-auto text-center ms-fade-rise">
        <h1 className="text-section font-bold text-ms-textPrimary mb-3 tracking-tight">
          Check Service Availability
        </h1>
        <p className="text-sm sm:text-base text-ms-textSecondary max-w-xl mx-auto leading-relaxed">
          Select a healthcare facility type below to view live bed capacity, medicine stock, doctor availability, and specialized AI insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <CategoryCard
          title="Primary Health Centre (PHC)"
          description="Basic healthcare, maternal care, minor treatments, and routine OPD services."
          href="/availability/phc"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          }
        />
        <CategoryCard
          title="Community Health Centre (CHC)"
          description="Advanced outpatient care, child healthcare, basic lab services, and specialized treatments."
          href="/availability/chc"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <path d="M3 21h18" />
              <path d="M19 21v-4" />
              <path d="M19 17a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4" />
              <path d="M14 15V9a2 2 0 0 0-2-2H9" />
              <path d="M10 3v4" />
              <path d="M8 5h4" />
            </svg>
          }
        />
        <CategoryCard
          title="Private Health Centre"
          description="Premium multi-speciality hospitals, ICUs, cancer care, advanced surgery, and 24x7 emergency."
          href="/availability/private"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <path d="M10 2v7.31" />
              <path d="M14 9.3V1.99" />
              <path d="M8.5 2h7" />
              <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
              <path d="M5.52 16h12.96" />
            </svg>
          }
        />
      </div>
    </main>
  );
}
