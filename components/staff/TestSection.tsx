"use client";

import { useState } from "react";
import { useSync } from "@/lib/offline/sync-provider";
import type { TestRow } from "@/domain/resource-monitoring/queries";

interface Props {
  initial: TestRow[];
}

export default function TestSection({ initial }: Props) {
  const { enqueue } = useSync();
  const [tests, setTests] = useState<TestRow[]>(initial);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle(test: TestRow) {
    const next = !test.is_functional;
    setPending(test.id);
    setError(null);
    setTests((prev) =>
      prev.map((t) => (t.id === test.id ? { ...t, is_functional: next } : t))
    );

    await enqueue(
      "resource-monitoring",
      "test.set",
      { testId: test.id, isFunctional: next },
      (res) => {
        if (!res.ok) {
          setTests((prev) =>
            prev.map((t) =>
              t.id === test.id ? { ...t, is_functional: test.is_functional } : t
            )
          );
          setError(res.error ?? "Update failed");
        }
        setPending(null);
      }
    );
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="mb-3 font-semibold">Test / Equipment Availability</h2>
      {error && (
        <p className="mb-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {tests.length === 0 ? (
        <p className="text-sm text-gray-500">No tests recorded for your facility.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {tests.map((t) => (
            <li key={t.id} className="flex items-center justify-between py-2">
              <span className="font-medium">{t.test_name}</span>
              <button
                type="button"
                onClick={() => toggle(t)}
                disabled={pending === t.id}
                aria-pressed={t.is_functional}
                className={`rounded-full px-4 py-1 text-sm font-medium ${
                  t.is_functional
                    ? "bg-watch/10 text-watch"
                    : "bg-critical/10 text-critical"
                } disabled:opacity-50`}
              >
                {t.is_functional ? "Functional" : "Down"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
