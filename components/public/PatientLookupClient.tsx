"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import LangToggle from "@/components/LangToggle";
import { useLanguage } from "@/lib/i18n/LanguageContext";
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
  const { language, t } = useLanguage();
  const [facilityId, setFacilityId] = useState<string | null>(initialFacilityId);
  const [availability, setAvailability] = useState(initialAvailability);
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState<{ from: "patient" | "bot"; text: string }[]>([]);
  const [draft, setDraft] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const sessionRef = useRef<string>(newSessionToken());
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  function selectFacility(id: string) {
    setFacilityId(id);
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
        { from: "bot", text: res.answer ?? (res.grounded ? t.chat_err_grounded : t.chat_err_facility) },
      ]);
    } catch {
      setChat((c) => [...c, { from: "bot", text: t.chat_err_network }]);
    } finally {
      setChatBusy(false);
    }
  }

  const selectedFacility = facilities.find(f => f.id === facilityId);

  return (
    <div className="min-h-screen min-h-dvh bg-ms-bg">
      <header className="sticky top-0 z-40 flex justify-center px-4 pt-3 pb-2">
        <nav
          className={`
            ms-pill-nav flex items-center gap-2 rounded-full border border-ms-border
            bg-ms-surface shadow-card-lg
            ${pillCompact ? "px-4 py-2" : "px-5 py-3"}
          `}
          aria-label="Patient lookup navigation"
        >
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
          <LangToggle />
          <div className="mx-1 h-4 w-px bg-ms-border" aria-hidden="true" />
          <ThemeToggle className="!border-transparent !px-2 !py-1" />
          <Link
            href="/"
            className="rounded-full px-3 py-1.5 text-xs font-medium text-ms-textSecondary transition-colors hover:bg-ms-surface2 hover:text-ms-textPrimary"
          >
            {t.home}
          </Link>

          {!pillCompact && (
            <span className="ml-1 hidden rounded-full border border-[#B8E2CA] bg-watch-tint px-2.5 py-1 text-xs font-medium text-watch md:inline-flex" data-no-invert>
              {t.no_login_needed}
            </span>
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-patient px-4 pb-12 pt-6 sm:px-6">
        <div className="mb-6">
          <h1 className="text-section font-bold text-ms-textPrimary">
            {t.lookup_title}
          </h1>
          <p className="mt-1 text-sm text-ms-textSecondary">
            {t.lookup_subtitle}
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="facility-select" className="mb-1.5 block text-sm font-medium text-ms-textPrimary">
            {t.search_facility}
          </label>
          <select
            id="facility-select"
            value={facilityId ?? ""}
            onChange={(e) => selectFacility(e.target.value)}
            className="
              w-full rounded-ms-sm border border-ms-border bg-ms-surface
              px-4 py-3 text-ms-textPrimary
              focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20
              transition-all duration-300
            "
            style={{ minHeight: "48px" }}
          >
            <option value="" disabled hidden>Select a Health Centre</option>
            <option value="PHC">Primary Health Centre (PHC)</option>
            <option value="CHC">Community Health Centre (CHC)</option>
            <option value="Private">Private Health Centre</option>
          </select>
        </div>

        {!facilityId ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-ms-md border border-ms-border bg-ms-surface p-12 text-center shadow-card transition-all duration-500 ms-fade-rise">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-tint text-brand">
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-ms-textPrimary">Select a Health Centre</h3>
            <p className="max-w-md text-sm text-ms-textSecondary">
              Choose a Primary Health Centre, Community Health Centre, or Private Health Centre to view available healthcare information and ask the AI assistant.
            </p>
          </div>
        ) : (
          <section className="mt-6 rounded-ms-md border border-ms-border bg-ms-surface shadow-card transition-all duration-500 ms-fade-rise">
            <div className="border-b border-ms-border px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold text-ms-textPrimary">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-brand" aria-hidden="true">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
              </svg>
              {t.ask_assistant}
              <span className="ml-auto text-xs text-ms-textDisabled">EN & हिं</span>
            </h2>
          </div>

          <div className="max-h-56 min-h-[80px] overflow-y-auto px-5 py-4 space-y-3">
            {chat.length === 0 && (
              <p className="text-sm italic text-ms-textDisabled">
                Ask about medicine availability, doctor availability, bed status, healthcare services, or nearby health centres.
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

          <div className="border-t border-ms-border px-5 py-3 bg-ms-surface/50 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            <div className="flex gap-2 transition-all duration-300">
              {[
                "Paracetamol available?",
                "Which PHC is nearest?",
                "Are beds available?",
                "Is a doctor available today?",
                "Which CHC has X-ray?",
                "Available in Hindi?"
              ].map((suggestion, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setDraft(suggestion);
                    document.getElementById('chat-input')?.focus();
                  }}
                  className="rounded-full border border-ms-border bg-ms-surface px-3 py-1.5 text-xs text-ms-textPrimary transition-all hover:border-brand hover:text-brand whitespace-nowrap shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
          <form onSubmit={sendChat} className="flex gap-2 border-t border-ms-border px-5 py-4">
            <input
              id="chat-input"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your healthcare question..."
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
              {chatBusy ? "…" : t.ask_btn}
            </button>
          </form>
        </section>
        )}
      </main>
    </div>
  );
}
