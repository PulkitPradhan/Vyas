"use client";

import { useEffect, useState, useCallback } from "react";
import { useSync } from "@/lib/offline/sync-provider";
import { createClient } from "@/lib/supabase/client";
import SeverityBadge from "./SeverityBadge";
import { updateSuggestionStatus, resolveFlag } from "@/domain/admin/actions";
import type { FlagRow, SuggestionRow } from "@/domain/admin/queries";

interface Props {
  initialFlags: FlagRow[];
  initialSuggestions: SuggestionRow[];
  language: "en" | "hi";
}

// Live flag list + suggestion cards. Subscribes to Supabase Realtime on the
// `flags` table (ADR-004) so a newly-raised flag appears within the same minute
// a pharmacist logs a stock-out — the demo's central "real-time" claim.
export default function FlagsList({ initialFlags, initialSuggestions, language }: Props) {
  const [flags, setFlags] = useState<FlagRow[]>(initialFlags);
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>(initialSuggestions);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const { online } = useSync();

  // Refresh the full ordered list from the server (simpler + still real-time;
  // a row-level Realtime payload only carries the changed row's id, so a
  // uniform re-fetch keeps facility-name joins coherent).
  const refreshFlags = useCallback(async () => {
    const res = await fetch("/api/admin/flags", { method: "POST" });
    if (!res.ok) return;
    const data = (await res.json()) as { flags: FlagRow[] };
    if (data?.flags) setFlags(data.flags);
  }, []);

  useEffect(() => {
    try {
      const supabase = createClient();
      const channel = supabase
        .channel("flags-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "flags" },
          () => {
            // Debounce isn't critical for a district dashboard; a re-fetch per
            // event is bounded by staff write volume.
            void refreshFlags();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      // No Supabase env configured (build/dev) — the initial server-fetched
      // list still renders; live updates just won't push.
    }
  }, [refreshFlags]);

  const reasonFor = (f: FlagRow) => {
    const text = language === "hi" ? f.reason_text_hi : f.reason_text_en;
    if (text) return text;
    // ADR-005: reason_text may still be null if Gemini hasn't run or failed.
    // Show the raw computed context instead of a blank space, so the admin
    // never sees an unexplained flag.
    return rawReasonFallback(f);
  };

  function rawReasonFallback(f: FlagRow): string {
    switch (f.category) {
      case "stock":
        return `Low-stock projection flagged (${f.severity}). Reason pending AI explanation.`;
      case "bed":
        return `Bed occupancy at/over threshold (${f.severity}).`;
      case "doctor":
        return `No doctor check-in past cutoff (${f.severity}).`;
      case "test":
        return `Equipment/test non-functional (${f.severity}).`;
      default:
        return `Flag raised (${f.severity}).`;
    }
  }

  async function handleSuggestion(id: string, status: "actioned" | "dismissed") {
    setBusy((b) => ({ ...b, [`s:${id}`]: true }));
    const res = await updateSuggestionStatus(id, status);
    if (res.ok) {
      setSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
    }
    setBusy((b) => {
      const next = { ...b };
      delete next[`s:${id}`];
      return next;
    });
  }

  async function handleResolveFlag(id: string) {
    setBusy((b) => ({ ...b, [`f:${id}`]: true }));
    const res = await resolveFlag(id);
    if (res.ok) {
      setFlags((prev) => prev.filter((f) => f.id !== id));
    }
    setBusy((b) => {
      const next = { ...b };
      delete next[`f:${id}`];
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Live Flags</h2>
          <span className="text-sm text-gray-500">
            {online ? "real-time" : "offline — will refresh on reconnect"}
          </span>
        </div>

        {flags.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
            No unresolved flags in your district. Everything looks healthy.
          </p>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {flags.map((f) => (
              <li
                key={f.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{f.facility_name}</span>
                  <SeverityBadge severity={f.severity} />
                </div>
                <p className="mt-2 text-sm text-gray-600">{reasonFor(f)}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>
                    {f.category} · {new Date(f.created_at).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleResolveFlag(f.id)}
                    disabled={!!busy[`f:${f.id}`]}
                    className="rounded-md border border-gray-300 px-2 py-1 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Mark resolved
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Redistribution Suggestions</h2>
        {suggestions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
            No redistribution suggestions pending.
          </p>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-3">
            {suggestions.map((s) => (
              <li
                key={s.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <p className="font-semibold">{s.item_name}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {s.from_facility_name} → {s.to_facility_name}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Suggest <strong>{s.suggested_qty}</strong> · {s.distance_km} km
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSuggestion(s.id, "actioned")}
                    disabled={!!busy[`s:${s.id}`] || s.status !== "pending"}
                    className="rounded-md bg-watch px-2 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-40"
                  >
                    Actioned
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSuggestion(s.id, "dismissed")}
                    disabled={!!busy[`s:${s.id}`] || s.status !== "pending"}
                    className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-40"
                  >
                    Dismissed
                  </button>
                  {s.status !== "pending" && (
                    <span className="ml-auto self-center text-xs uppercase text-gray-400">
                      {s.status}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
