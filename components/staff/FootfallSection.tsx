"use client";

import { useState } from "react";
import { useSync } from "@/lib/offline/sync-provider";
import type { FootfallRow } from "@/domain/resource-monitoring/queries";

interface Props {
  initial: FootfallRow | null;
  facilityId: string;
}

export default function FootfallSection({ initial, facilityId }: Props) {
  const { enqueue } = useSync();
  const [count, setCount] = useState<number>(initial?.count ?? 0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    setPending(true);
    setError(null);
    const next = count + 1;
    setCount(next); // optimistic

    await enqueue(
      "resource-monitoring",
      "footfall.increment",
      { facilityId },
      (res) => {
        if (!res.ok) {
          setCount(count);
          setError(res.error ?? "Could not record patient");
        } else {
          setCount((res.state?.count as number) ?? next);
        }
        setPending(false);
      }
    );
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Patient Footfall — Today</h2>
          <p className="mt-1 text-3xl font-bold tabular-nums">{count}</p>
        </div>
        <button
          type="button"
          onClick={add}
          disabled={pending}
          className="rounded-lg bg-gray-900 px-5 py-3 text-lg font-medium text-white hover:bg-gray-700 disabled:opacity-40"
        >
          + 1 patient
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </section>
  );
}
