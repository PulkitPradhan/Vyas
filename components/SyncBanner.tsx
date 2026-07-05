"use client";

import { useSyncBanner } from "@/lib/offline/sync-provider";

// Persistent, always-visible sync-status indicator (DESIGN.md §3): small
// banner showing "Offline — N actions queued" vs "Synced". Never buried.
export default function SyncBanner() {
  const { tone, text } = useSyncBanner();

  const styles =
    tone === "offline"
      ? "bg-amber-500 text-white"
      : tone === "syncing"
      ? "bg-sky-600 text-white"
      : "bg-watch text-white";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-0 left-0 right-0 z-50 ${styles} px-4 py-2 text-center text-sm shadow-lg`}
    >
      {text}
    </div>
  );
}
