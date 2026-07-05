// Result + action-envelope types shared across all Resource Monitoring
// Server Actions and the offline queue (Phase 5).
//
// Design: every write Server Action returns a deterministic ActionResult so the
// offline queue can replay a queued call with the EXACT same payload shape it
// would have sent live. The `actionKey` is a stable string identifying which
// Server Action to invoke on replay (see lib/offline/replay.ts).

export type ActionKey =
  | "stock.adjust"
  | "stock.restock"
  | "bed.set"
  | "bed.toggle"
  | "test.set"
  | "footfall.increment"
  | "doctor.checkIn"
  | "doctor.checkOut";

export interface ActionResult {
  ok: boolean;
  error?: string;
  // The committed-after state so the UI's optimistic update can be reconciled.
  state?: Record<string, unknown>;
}

// Canonical envelope stored in the IndexedDB queue and passed to the replay
// router. The same shape is used for a live call (processed immediately) and
// a queued call (flushed on reconnect) — that equivalence is the whole point.
export interface QueuedAction {
  id?: number;              // Dexie autoincrement, present once queued
  actionKey: ActionKey;
  payload: Record<string, unknown>;
  createdAt: number;
  synced: boolean;
}

// Resource-monitoring action keys — consumed by the offline replay router and
// by anything enumerating the staff-data-entry actions. Lives here (not in a
// "use server" file) so importing it never breaks Server-Action bundling rules.
export const RESOURCE_ACTION_KEYS: ActionKey[] = [
  "stock.adjust",
  "stock.restock",
  "bed.set",
  "bed.toggle",
  "test.set",
  "footfall.increment",
];
