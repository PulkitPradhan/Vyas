"use client";

import { useState, useRef } from "react";
import { askChatbot } from "@/domain/patient-access/actions";
import type {
  PatientFacility,
  PatientStockItem,
  PatientBedStatus,
  PatientTestStatus,
} from "@/domain/patient-access/queries";

interface Props {
  facilities: PatientFacility[];
  initialFacilityId: string | null;
  initialAvailability: {
    stock: PatientStockItem[];
    beds: PatientBedStatus | null;
    tests: PatientTestStatus[];
  };
}

// Anonymous session token generated client-side only, persisted for chat
// continuity. NOT tied to identity — per ADR-008 the public lookup collects
// no personal data.
function newSessionToken(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function PatientLookupClient({
  facilities,
  initialFacilityId,
  initialAvailability,
}: Props) {
  const [facilityId, setFacilityId] = useState<string | null>(initialFacilityId);
  const [availability, setAvailability] = useState(initialAvailability);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi">("hi");

  const [chat, setChat] = useState<
    { from: "patient" | "bot"; text: string }[]
  >([]);
  const [draft, setDraft] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const sessionRef = useRef<string>(newSessionToken());

  async function selectFacility(id: string) {
    setFacilityId(id);
    setLoading(true);
    try {
      const res = await fetch("/api/public/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facilityId: id }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          stock: PatientStockItem[];
          beds: PatientBedStatus | null;
          tests: PatientTestStatus[];
        };
        setAvailability(data);
      }
    } finally {
      setLoading(false);
    }
  }

  async function sendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || chatBusy) return;
    const text = draft.trim();
    setDraft("");
    setChat((c) => [...c, { from: "patient", text }]);
    setChatBusy(true);
    try {
      const res = await askChatbot({
        query: text,
        language,
        facilityId: facilityId ?? undefined,
        patientSession: sessionRef.current,
      });
      setChat((c) => [
        ...c,
        {
          from: "bot",
          text: res.answer ?? fallbackAnswer(text, res.grounded),
        },
      ]);
    } catch {
      setChat((c) => [
        ...c,
        { from: "bot", text: "Sorry, couldn't reach the assistant right now." },
      ]);
    } finally {
      setChatBusy(false);
    }
  }

  function fallbackAnswer(_q: string, grounded: boolean): string {
    if (!grounded) return "Please select a facility first so I can check exact availability.";
    return "Couldn't generate a reply — here are the current numbers above.";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Medicine · Beds · Tests — No login needed</h1>
        <div className="inline-flex rounded-md border border-gray-300 bg-white text-sm">
          {(["hi", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLanguage(l)}
              className={`px-3 py-1 ${
                language === l ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
              } ${l === "hi" ? "rounded-l-md" : "rounded-r-md"}`}
            >
              {l === "hi" ? "हिं" : "EN"}
            </button>
          ))}
        </div>
      </div>

      <label className="block text-sm font-medium text-gray-700">
        Choose a facility
        <select
          value={facilityId ?? ""}
          onChange={(e) => selectFacility(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
        >
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} ({f.type}) — {f.block}
            </option>
          ))}
        </select>
      </label>

      {loading ? (
        <p className="text-sm text-gray-500">Loading availability…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-2 font-semibold">Medicines</h2>
            {availability.stock.length === 0 ? (
              <p className="text-sm text-gray-500">None listed.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {availability.stock.map((s, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{s.item_name}</span>
                    <span className={s.quantity <= 10 ? "font-semibold text-amber-700" : ""}>
                      {s.quantity} {s.unit}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-2 font-semibold">Beds</h2>
            {availability.beds ? (
              <p className="text-sm">
                <span className="text-3xl font-bold">{availability.beds.available}</span> of{" "}
                {availability.beds.total} free
                {availability.beds.available === 0 && (
                  <span className="ml-2 rounded-full bg-critical/15 px-2 py-0.5 text-xs text-critical">Full</span>
                )}
              </p>
            ) : (
              <p className="text-sm text-gray-500">No bed data.</p>
            )}
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-2 font-semibold">Tests</h2>
            {availability.tests.length === 0 ? (
              <p className="text-sm text-gray-500">None listed.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {availability.tests.map((t, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{t.test_name}</span>
                    <span className={t.is_functional ? "text-watch" : "text-critical"}>
                      {t.is_functional ? "Yes" : "No"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 font-semibold">Ask the assistant</h2>
        <div className="mb-3 max-h-48 space-y-2 overflow-auto">
          {chat.length === 0 && (
            <p className="text-sm text-gray-500">
              e.g. “Rampur PHC mein paracetamol hai kya?”
            </p>
          )}
          {chat.map((m, i) => (
            <p
              key={i}
              className={`text-sm ${m.from === "patient" ? "text-gray-700" : "font-medium text-gray-900"}`}
            >
              {m.from === "patient" ? "You: " : "Assistant: "}
              {m.text}
            </p>
          ))}
        </div>
        <form onSubmit={sendChat} className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your question…"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={chatBusy || !draft.trim()}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-40"
          >
            {chatBusy ? "…" : "Ask"}
          </button>
        </form>
      </section>
    </div>
  );
}
