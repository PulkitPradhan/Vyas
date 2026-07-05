"use client";

import { useState, useMemo } from "react";
import { useSync } from "@/lib/offline/sync-provider";
import type { StockItemRow } from "@/domain/resource-monitoring/queries";
import type { ActionKey } from "@/domain/types";
import VoiceInput from "./VoiceInput";

interface Props {
  initial: StockItemRow[];
  facilityId: string;
}

export default function StockSection({ initial, facilityId }: Props) {
  const { enqueue } = useSync();
  const [items, setItems] = useState<StockItemRow[]>(initial);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((i) => i.item_name.toLowerCase().includes(q));
  }, [items, query]);

  async function adjust(itemId: string, currentQty: number, delta: number) {
    setPending((p) => ({ ...p, [itemId]: true }));
    setError(null);

    // Optimistic UI update — instant, never blocked on sync (ADR-003).
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
      )
    );

    const action: ActionKey = "stock.adjust";
    await enqueue(
      "resource-monitoring",
      action,
      { stockItemId: itemId, delta, source: "app" },
      (res) => {
        if (!res.ok) {
          // Roll back optimistic update on hard failure.
          setItems((prev) =>
            prev.map((i) => (i.id === itemId ? { ...i, quantity: currentQty } : i))
          );
          setError(res.error ?? "Update failed");
        } else if (res.state?.quantity !== undefined) {
          // Reconcile to committed value.
          setItems((prev) =>
            prev.map((i) =>
              i.id === itemId
                ? { ...i, quantity: res.state!.quantity as number }
                : i
            )
          );
        }
        setPending((p) => {
          const next = { ...p };
          delete next[itemId];
          return next;
        });
      }
    );
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Stock</h2>
        <span className="text-xs text-gray-400">{items.length} items</span>
      </div>

      <input
        type="search"
        placeholder="Search items…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
      />

      <VoiceInput
        facilityId={facilityId}
        language="hi"
        items={items}
        onApplied={(itemName, quantity) =>
          setItems((prev) =>
            prev.map((i) =>
              i.item_name.toLowerCase() === itemName.toLowerCase()
                ? { ...i, quantity }
                : i
            )
          )
        }
      />

      {error && (
        <p className="mb-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">No items found.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between py-2"
              data-pending={pending[item.id] ? "1" : "0"}
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{item.item_name}</p>
                <p className="text-sm text-gray-500">
                  {item.quantity} {item.unit}
                  {item.quantity <= 10 && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                      low
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={`Decrease ${item.item_name}`}
                  onClick={() => adjust(item.id, item.quantity, -1)}
                  disabled={!!pending[item.id] || item.quantity <= 0}
                  className="h-10 w-10 rounded-full bg-gray-100 text-xl font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-40"
                >
                  −
                </button>
                <span className="w-8 text-center text-lg font-semibold tabular-nums">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  aria-label={`Increase ${item.item_name}`}
                  onClick={() => adjust(item.id, item.quantity, 1)}
                  disabled={!!pending[item.id]}
                  className="h-10 w-10 rounded-full bg-gray-100 text-xl font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
