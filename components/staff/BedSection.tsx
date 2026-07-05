"use client";

import { useState } from "react";
import { useSync } from "@/lib/offline/sync-provider";
import type { BedStatusRow } from "@/domain/resource-monitoring/queries";

interface Props {
  initial: BedStatusRow | null;
  facilityId: string;
}

export default function BedSection({ initial, facilityId }: Props) {
  const { enqueue } = useSync();
  const [bed, setBed] = useState<BedStatusRow | null>(initial);
  const [pending, setPending] = useState<"admit" | "discharge" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(direction: "admit" | "discharge") {
    setPending(direction);
    setError(null);

    // Optimistic — instant, never blocked on sync.
    setBed((prev) => {
      if (!prev) return prev;
      const occupied =
        direction === "admit"
          ? Math.min(prev.total, prev.occupied + 1)
          : Math.max(0, prev.occupied - 1);
      return { ...prev, occupied, available: prev.total - occupied };
    });

    await enqueue(
      "resource-monitoring",
      "bed.toggle",
      { facilityId, direction },
      (res) => {
        if (!res.ok) {
          setBed(initial);
          setError(res.error ?? "Update failed");
        } else if (res.state) {
          setBed({
            facility_id: res.state.facilityId as string,
            total: res.state.total as number,
            occupied: res.state.occupied as number,
            available: (res.state.total as number) - (res.state.occupied as number),
          });
        }
        setPending(null);
      }
    );
  }

  const full = bed ? bed.available === 0 : false;

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="mb-3 font-semibold">Beds</h2>

      {error && (
        <p className="mb-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {!bed ? (
        <p className="text-sm text-gray-500">No bed status recorded yet.</p>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="text-3xl font-bold text-gray-900">
                {bed.available}
              </span>{" "}
              of {bed.total} free · {bed.occupied} occupied
            </div>
            {full && (
              <span className="rounded-full bg-critical/10 px-2 py-1 text-xs font-medium text-critical">
                Full
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handle("admit")}
              disabled={pending !== null || full}
              className="rounded-lg bg-gray-900 px-4 py-3 font-medium text-white hover:bg-gray-700 disabled:opacity-40"
            >
              + Occupied
            </button>
            <button
              type="button"
              onClick={() => handle("discharge")}
              disabled={pending !== null || bed.occupied === 0}
              className="rounded-lg border border-gray-300 px-4 py-3 font-medium hover:bg-gray-50 disabled:opacity-40"
            >
              − Occupied
            </button>
          </div>
        </>
      )}
    </section>
  );
}
