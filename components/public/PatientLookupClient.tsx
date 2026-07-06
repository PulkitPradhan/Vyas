"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
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

function newSessionToken(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
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
  const [chat, setChat] = useState<{ from: "patient" | "bot"; text: string }[]>([]);
  const [draft, setDraft] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const sessionRef = useRef<string>(newSessionToken());
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Morphing pill navbar: compact on scroll-down, full on scroll-up
  const [pillCompact, setPillCompact] = useState(false);
  const lastScrollY = useRef(0);
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setPillCompact(y > lastScrollY.current && y > 60);
      lastScrollY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

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
        { from: "bot", text: res.answer ?? (res.grounded ? "Couldn't generate a reply — see numbers above." : "Please select a facility first.") },
      ]);
    } catch {
      setChat((c) => [...c, { from: "bot", text: "Sorry, couldn't reach the assistant right now." }]);
    } finally {
      setChatBusy(false);
    }
  }

  const selectedFacility = facilities.find(f => f.id === facilityId);

  return (
    <div className="min-h-screen min-h-dvh bg-ms-bg">
      {/* ── Morphing pill navbar ── */}
      <header className="sticky top-0 z-40 flex justify-center px-4 pt-3 pb-2">
        <nav
          className={`
            ms-pill-nav flex items-center gap-2 rounded-full border border-ms-border
            bg-ms-surface shadow-card-lg
            ${pillCompact ? "px-4 py-2" : "px-5 py-3"}
          `}
          aria-label="Patient lookup navigation"
        >
          {/* Brand */}
          <div className={`flex items-center gap-2 transition-all duration-200 ${pillCompact ? "gap-1.5" : ""}`}>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M9 12h6M12 9v6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            {!pillCompact && (
              <span className="hidden sm:inline text-sm font-semibold text-ms-textPrimary">Vyas</span>
            )}
          </div>

          <div className="mx-2 h-4 w-px bg-ms-border" aria-hidden="true" />

          {/* Language toggle inside pill */}
          <div className="flex overflow-hidden rounded-full border border-ms-border text-xs">
            {(["hi", "en"] as const).map((l) => (
              <button
                key={l}
                id={`lang-pill-${l}`}
                type="button"
                onClick={() => setLanguage(l)}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  language === l
                    ? "bg-brand text-white"
                    : "bg-ms-surface text-ms-textSecondary hover:bg-ms-surface2"
                } ${l === "en" ? "border-l border-ms-border" : ""}`}
              >
                {l === "hi" ? "हिं" : "EN"}
              </button>
            ))}
          </div>

          {/* Theme Toggle & Home */}
          <div className="mx-1 h-4 w-px bg-ms-border" aria-hidden="true" />
          <ThemeToggle className="!border-transparent !px-2 !py-1" />
          <Link
            href="/"
            className="rounded-full px-3 py-1.5 text-xs font-medium text-ms-textSecondary transition-colors hover:bg-ms-surface2 hover:text-ms-textPrimary"
          >
            Home
          </Link>

          {/* No login badge */}
          {!pillCompact && (
            <span className="ml-1 hidden rounded-full border border-[#B8E2CA] bg-watch-tint px-2.5 py-1 text-xs font-medium text-watch md:inline-flex">
              No login needed
            </span>
          )}
        </nav>
      </header>

      {/* ── Main content ── */}
      <main className="mx-auto max-w-patient px-4 pb-12 pt-6 sm:px-6">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-section font-bold text-ms-textPrimary">
            {language === "hi" ? "पास के PHC में क्या उपलब्ध है?" : "What's available at your nearest PHC?"}
          </h1>
          <p className="mt-1 text-sm text-ms-textSecondary">
            {language === "hi"
              ? "कोई लॉगिन नहीं · दवा · बिस्तर · डॉक्टर"
              : "No login needed · Medicine · Beds · Tests"}
          </p>
        </div>

        {/* Facility selector */}
        <div className="mb-6">
          <label htmlFor="facility-select" className="mb-1.5 block text-sm font-medium text-ms-textPrimary">
            {language === "hi" ? "स्वास्थ्य केंद्र चुनें" : "Choose a health centre"}
          </label>
          <select
            id="facility-select"
            value={facilityId ?? ""}
            onChange={(e) => selectFacility(e.target.value)}
            className="
              w-full rounded-ms-sm border border-ms-border bg-ms-surface
              px-4 py-3 text-ms-textPrimary
              focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20
            "
            style={{ minHeight: "48px" }}
          >
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.type}) — {f.block}
              </option>
            ))}
          </select>
        </div>

        {/* Facility name banner */}
        {selectedFacility && !loading && (
          <div className="mb-4 flex items-center gap-2 rounded-ms-sm border border-brand-light bg-brand-tint px-4 py-2.5 text-sm font-medium text-brand">
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path fillRule="evenodd" d="M8 0C5.243 0 3 2.243 3 5c0 2.67 4.196 8.578 4.385 8.829a.75.75 0 001.23 0C8.804 13.578 13 7.67 13 5c0-2.757-2.243-5-5-5zm0 7a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
            </svg>
            Showing data for {selectedFacility.name}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="h-6 w-6 animate-spin text-brand" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span className="ml-3 text-sm text-ms-textSecondary">Loading availability…</span>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Medicines */}
            <section className="rounded-ms-md border border-ms-border bg-ms-surface p-5 shadow-card">
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-ms-textPrimary">
                <span aria-hidden="true">💊</span>
                {language === "hi" ? "दवाएं" : "Medicines"}
              </h2>
              {availability.stock.length === 0 ? (
                <p className="text-sm text-ms-textSecondary">{language === "hi" ? "कोई दवा सूचीबद्ध नहीं" : "None listed."}</p>
              ) : (
                <ul className="space-y-2">
                  {availability.stock.map((s, i) => {
                    const ok = s.quantity > 10;
                    return (
                      <li key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`h-2 w-2 flex-shrink-0 rounded-full ${ok ? "bg-watch" : "bg-warning"}`}
                            aria-hidden="true"
                          />
                          <span className="truncate text-ms-textPrimary">{s.item_name}</span>
                        </div>
                        <span className={`ml-2 flex-shrink-0 font-semibold tabular-nums ${ok ? "text-watch" : "text-warning"}`}>
                          {s.quantity} {s.unit}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* Beds */}
            <section className="rounded-ms-md border border-ms-border bg-ms-surface p-5 shadow-card">
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-ms-textPrimary">
                <span aria-hidden="true">🛏</span>
                {language === "hi" ? "बिस्तर" : "Beds"}
              </h2>
              {availability.beds ? (
                <div>
                  <div className="flex items-end gap-2">
                    <span className="text-hero font-extrabold tabular-nums text-ms-textPrimary">
                      {availability.beds.available}
                    </span>
                    <span className="mb-1 text-sm text-ms-textSecondary">
                      / {availability.beds.total} {language === "hi" ? "खाली" : "free"}
                    </span>
                  </div>
                  {availability.beds.available === 0 && (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-[#EDB3B3] bg-critical-tint px-3 py-1 text-xs font-semibold text-critical">
                      <svg viewBox="0 0 10 10" fill="currentColor" className="h-2.5 w-2.5" aria-hidden="true">
                        <path fillRule="evenodd" d="M5 1a4 4 0 100 8A4 4 0 005 1zM4.25 2.75a.75.75 0 011.5 0v2a.75.75 0 01-1.5 0v-2zm.75 4.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd"/>
                      </svg>
                      {language === "hi" ? "भरा हुआ" : "Full"}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-ms-textSecondary">{language === "hi" ? "जानकारी नहीं" : "No bed data."}</p>
              )}
            </section>

            {/* Tests */}
            <section className="rounded-ms-md border border-ms-border bg-ms-surface p-5 shadow-card">
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-ms-textPrimary">
                <span aria-hidden="true">🔬</span>
                {language === "hi" ? "जांच / सेवाएं" : "Tests / Services"}
              </h2>
              {availability.tests.length === 0 ? (
                <p className="text-sm text-ms-textSecondary">{language === "hi" ? "कोई जांच नहीं" : "None listed."}</p>
              ) : (
                <ul className="space-y-2">
                  {availability.tests.map((t, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span className="truncate text-ms-textPrimary">{t.test_name}</span>
                      <span className={`ml-2 flex flex-shrink-0 items-center gap-1 font-semibold ${
                        t.is_functional ? "text-watch" : "text-critical"
                      }`}>
                        {t.is_functional ? (
                          <svg viewBox="0 0 12 12" fill="currentColor" className="h-3 w-3" aria-hidden="true">
                            <path fillRule="evenodd" d="M10.03 3.22a.75.75 0 010 1.06L5.5 8.81 2.97 6.28a.75.75 0 011.06-1.06L5.5 6.69l3.47-3.47a.75.75 0 011.06 0z" clipRule="evenodd"/>
                          </svg>
                        ) : (
                          <svg viewBox="0 0 12 12" fill="currentColor" className="h-3 w-3" aria-hidden="true">
                            <path d="M3.22 3.22a.75.75 0 011.06 0L6 4.94l1.72-1.72a.75.75 0 111.06 1.06L7.06 6l1.72 1.72a.75.75 0 11-1.06 1.06L6 7.06l-1.72 1.72a.75.75 0 01-1.06-1.06L4.94 6 3.22 4.28a.75.75 0 010-1.06z"/>
                          </svg>
                        )}
                        {t.is_functional
                          ? (language === "hi" ? "उपलब्ध" : "Yes")
                          : (language === "hi" ? "नहीं" : "No")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        {/* ── Chatbot section ── */}
        <section className="mt-6 rounded-ms-md border border-ms-border bg-ms-surface shadow-card">
          <div className="border-b border-ms-border px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold text-ms-textPrimary">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-brand" aria-hidden="true">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
              </svg>
              {language === "hi" ? "सहायक से पूछें" : "Ask the assistant"}
              <span className="ml-auto text-xs text-ms-textDisabled">EN & हिं</span>
            </h2>
          </div>

          {/* Chat bubbles */}
          <div className="max-h-56 min-h-[80px] overflow-y-auto px-5 py-4 space-y-3">
            {chat.length === 0 && (
              <p className="text-sm italic text-ms-textDisabled">
                {language === "hi"
                  ? "उदाहरण: \"Rampur PHC mein paracetamol hai kya?\""
                  : "e.g. \"Is paracetamol available at PHC Rampur?\""}
              </p>
            )}
            {chat.map((m, i) => (
              <div
                key={i}
                className={`flex ms-fade-rise ${m.from === "patient" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-ms-md px-4 py-2.5 text-sm leading-relaxed ${
                    m.from === "patient"
                      ? "bg-brand text-white"
                      : "border border-ms-border bg-ms-bg text-ms-textPrimary"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {chatBusy && (
              <div className="flex justify-start ms-fade-rise">
                <div className="rounded-ms-md border border-ms-border bg-ms-bg px-4 py-3">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ms-textDisabled" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ms-textDisabled" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ms-textDisabled" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendChat} className="flex gap-2 border-t border-ms-border px-5 py-4">
            <input
              id="chat-input"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={language === "hi" ? "अपना सवाल टाइप करें…" : "Type your question…"}
              className="
                flex-1 rounded-ms-sm border border-ms-border bg-ms-bg px-4 py-3
                text-sm text-ms-textPrimary placeholder:text-ms-textDisabled
                focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20
              "
              style={{ minHeight: "48px" }}
            />
            <button
              id="chat-send-btn"
              type="submit"
              disabled={chatBusy || !draft.trim()}
              className="
                ms-press rounded-ms-sm bg-brand px-5 py-3 text-sm font-semibold
                text-white shadow-brand transition-all hover:bg-brand-hover
                disabled:cursor-not-allowed disabled:opacity-40
              "
              style={{ minHeight: "48px" }}
            >
              {chatBusy ? "…" : (language === "hi" ? "भेजें" : "Ask")}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
