"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import FlagsList from "./FlagsList";
import type { FacilityMarker, FlagRow, SuggestionRow } from "@/domain/admin/queries";

interface Props {
  initialFlags: FlagRow[];
  initialFacilities: FacilityMarker[];
  initialSuggestions: SuggestionRow[];
}

// Leaflet touches `window` at import; load it client-only.
const FacilitiesMap = dynamic(() => import("./FacilitiesMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] w-full animate-pulse rounded-lg border border-gray-200 bg-gray-100" />
  ),
});

export default function AdminDashboardClient({
  initialFlags,
  initialFacilities,
  initialSuggestions,
}: Props) {
  // Language toggle lives here for now; Phase 14 will lift it to global state.
  const [language, setLanguage] = useState<"en" | "hi">("en");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">District Dashboard</h1>
        <div className="inline-flex rounded-md border border-gray-300 bg-white text-sm">
          {(["en", "hi"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLanguage(l)}
              className={`px-3 py-1 ${
                language === l ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
              } ${l === "en" ? "rounded-l-md" : "rounded-r-md"}`}
            >
              {l === "en" ? "EN" : "हिं"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FlagsList
            initialFlags={initialFlags}
            initialSuggestions={initialSuggestions}
            language={language}
          />
        </div>
        <div>
          <h2 className="mb-2 text-xl font-semibold">Facilities Map</h2>
          <FacilitiesMap facilities={initialFacilities} suggestions={initialSuggestions} />
        </div>
      </div>
    </div>
  );
}
