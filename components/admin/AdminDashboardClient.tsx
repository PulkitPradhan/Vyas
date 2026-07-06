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

const FacilitiesMap = dynamic(() => import("./FacilitiesMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] w-full animate-pulse rounded-ms-md border border-ms-border bg-ms-surface2" />
  ),
});

export default function AdminDashboardClient({
  initialFlags,
  initialFacilities,
  initialSuggestions,
}: Props) {
  const [language, setLanguage] = useState<"en" | "hi">("en");

  const criticalCount = initialFlags.filter(f => f.severity === "critical").length;
  const warningCount  = initialFlags.filter(f => f.severity === "warning").length;
  const watchCount    = initialFlags.filter(f => f.severity === "watch").length;

  return (
    <div className="space-y-6">
      {/* ── Dashboard header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-admin-xl font-extrabold tracking-tight text-ms-textPrimary">
            District Dashboard
          </h1>
          <p className="mt-1 text-admin-sm text-ms-textSecondary">Live facility flags · Redistribution suggestions</p>
        </div>

        {/* Language toggle */}
        <div className="flex items-center gap-2">
          <span className="text-admin-xs text-ms-textSecondary">Language:</span>
          <div className="inline-flex overflow-hidden rounded-ms-sm border border-ms-border bg-ms-surface text-admin-sm">
            {(["en", "hi"] as const).map((l) => (
              <button
                key={l}
                id={`lang-${l}`}
                type="button"
                onClick={() => setLanguage(l)}
                className={`px-4 py-2 font-medium transition-colors ${
                  language === l
                    ? "bg-brand text-white"
                    : "text-ms-textSecondary hover:bg-ms-surface2"
                } ${l === "en" ? "" : "border-l border-ms-border"}`}
              >
                {l === "en" ? "EN" : "हिं"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <SummaryCard value={criticalCount} label="Critical" color="critical" />
        <SummaryCard value={warningCount}  label="Warning"  color="warning" />
        <SummaryCard value={watchCount}    label="Watch"    color="watch" />
      </div>

      {/* ── Main content: flags + map ── */}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <FlagsList
            initialFlags={initialFlags}
            initialSuggestions={initialSuggestions}
            language={language}
          />
        </div>
        <div>
          <h2 className="mb-3 text-admin-md font-semibold text-ms-textPrimary">Facilities Map</h2>
          <div className="h-[380px] overflow-hidden rounded-ms-md border border-ms-border shadow-card">
            <FacilitiesMap facilities={initialFacilities} suggestions={initialSuggestions} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  value, label, color,
}: {
  value: number;
  label: string;
  color: "critical" | "warning" | "watch";
}) {
  const styles = {
    critical: "bg-critical-tint border-[#EDB3B3] text-critical",
    warning:  "bg-warning-tint  border-[#E8C97A]  text-warning",
    watch:    "bg-watch-tint    border-[#B8E2CA]  text-watch",
  };
  const icons = {
    critical: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm7.25-3.25a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 6a.75.75 0 100 1.5.75.75 0 000-1.5z" clipRule="evenodd"/>
      </svg>
    ),
    warning: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
      </svg>
    ),
    watch: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm7.25-3.25a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 6a.75.75 0 100 1.5.75.75 0 000-1.5z" clipRule="evenodd"/>
      </svg>
    ),
  };
  return (
    <div className={`rounded-ms-md border p-4 ${styles[color]}`}>
      <div className="flex items-center gap-2">
        {icons[color]}
        <span className="text-admin-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-3xl font-extrabold tabular-nums">{value}</p>
    </div>
  );
}
