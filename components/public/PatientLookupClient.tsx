"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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

const DEMO_PHCS = [
  {
    id: "phc-1",
    name: "PHC Dhauj",
    location: "Village Dhauj, Faridabad, Haryana",
    status: "Open Today",
    rating: 4.3,
    type: "Government Primary Health Centre",
    services: ["General Medicine", "Minor Treatments", "Routine OPD", "Maternal Care", "Basic Healthcare"],
    certification: "Certified Public Healthcare Facility",
    phone: "0129-2206602",
    emergency: "+91-9716286475",
    beds: 12,
    medicines: "85%",
    doctors: 3,
    aiInsight: "No shortages predicted today.",
  },
  {
    id: "phc-2",
    name: "PHC Mohna",
    location: "Mohna, Ballabgarh, Faridabad",
    status: "Open Today",
    rating: 4.5,
    type: "Government Primary Health Centre",
    services: ["General Medicine", "Dental Procedures", "Eye Camps", "Maternal Care"],
    certification: "National Quality Certified",
    phone: "9910132792",
    email: "phcmohna2@gmail.com",
    beds: 8,
    medicines: "90%",
    doctors: 2,
    aiInsight: "Routine checkups ongoing.",
  },
  {
    id: "phc-3",
    name: "PHC Dayalpur",
    location: "Dayalpur, Ballabgarh, Faridabad, Haryana",
    status: "Open Today",
    rating: 4.4,
    type: "Government Primary Health Centre",
    services: ["Routine OPD", "Community Medicine", "Maternal Care", "AYUSH Services", "Referrals"],
    certification: "",
    phone: "+91-129-2207212",
    beds: 15,
    medicines: "80%",
    doctors: 4,
    aiInsight: "Special AYUSH camp active.",
  }
];

const DEMO_CHCS = [
  {
    id: "chc-1",
    name: "CHC Kheri Kalan",
    location: "Sector 84, Kheri Kalan, Faridabad, Haryana",
    status: "Open Today",
    rating: 4.4,
    type: "Government Community Health Centre",
    services: ["General Medicine", "Emergency Care", "Maternal Care", "Child Healthcare", "Community Health", "Outpatient Services"],
    certification: "",
    phone: "9810746590",
    email: "chc.kheri@yahoo.com",
    beds: 24,
    medicines: "92%",
    doctors: 5,
    aiInsight: "Normal patient load today.",
  },
  {
    id: "chc-2",
    name: "CHC Kurali",
    location: "Near Dayalpur, Kurali, Faridabad District, Haryana",
    status: "Open Today",
    rating: 4.5,
    type: "Government Community Health Centre",
    services: ["General Medicine", "Outpatient Care", "Maternal Care", "Child Care", "Community Health Monitoring", "Basic Laboratory"],
    certification: "",
    phone: "8958327740",
    email: "vaibhavsharma.040971@gmail.com",
    beds: 18,
    medicines: "95%",
    doctors: 4,
    aiInsight: "Medicine inventory is fully stocked.",
  },
  {
    id: "chc-3",
    name: "CHC Tigaon",
    location: "Village Tigaon, Faridabad, Haryana",
    status: "Open Today",
    rating: 4.3,
    type: "Government Community Health Centre",
    services: ["Routine OPD", "General Medicine", "Maternal Care", "Vaccination", "Health Camps", "Community Outreach"],
    certification: "",
    phone: "9592191906",
    email: "chc.tigaon@gmail.com",
    beds: 20,
    medicines: "89%",
    doctors: 6,
    aiInsight: "Moderate patient footfall expected today.",
  }
];

const DEMO_FILTERS = ["All", "Open Now", "Nearby", "High Rating", "Government"];

export default function PatientLookupClient({
  facilities,
  initialFacilityId,
  initialAvailability,
}: Props) {
  const { language, t } = useLanguage();
  const [facilityId, setFacilityId] = useState<string | null>(initialFacilityId);
  const [chat, setChat] = useState<{ from: "patient" | "bot"; text: string }[]>([]);
  const [draft, setDraft] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const sessionRef = useRef<string>(newSessionToken());
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [pillCompact, setPillCompact] = useState(false);
  const lastScrollY = useRef(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

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
    setSearchQuery(""); // Reset search when switching facility types
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

  const filteredFacilities = useMemo(() => {
    let baseData = facilityId === "PHC" ? DEMO_PHCS : facilityId === "CHC" ? DEMO_CHCS : [];
    let filtered = baseData;
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeFilter === "High Rating") {
      filtered = filtered.filter(p => p.rating >= 4.4);
    }
    return filtered;
  }, [facilityId, searchQuery, activeFilter]);

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

      <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-6">
        <div className="mb-6 max-w-3xl mx-auto">
          <h1 className="text-section font-bold text-ms-textPrimary">
            {t.lookup_title}
          </h1>
          <p className="mt-1 text-sm text-ms-textSecondary">
            {t.lookup_subtitle}
          </p>
        </div>

        <div className="mb-6 max-w-3xl mx-auto">
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
          <div className="mt-6 flex flex-col items-center justify-center rounded-ms-md border border-ms-border bg-ms-surface p-12 text-center shadow-card transition-all duration-500 ms-fade-rise max-w-3xl mx-auto">
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
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {(facilityId === "PHC" || facilityId === "CHC") && (
              <div className="mb-8 ms-fade-rise max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
                  <div className="relative w-full sm:max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-ms-textDisabled" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder={`Search nearby ${facilityId}s...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-ms-border bg-ms-surface rounded-ms-sm text-sm text-ms-textPrimary focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors shadow-sm"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {DEMO_FILTERS.map(f => (
                      <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeFilter === f ? 'bg-brand text-white shadow-brand-sm' : 'bg-ms-surface border border-ms-border text-ms-textSecondary hover:border-brand/50 hover:text-ms-textPrimary'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  {filteredFacilities.map((facility, index) => (
                    <div key={facility.id} className="group flex flex-col md:flex-row gap-6 p-5 sm:p-6 rounded-ms-md border border-ms-border bg-ms-surface shadow-card hover:shadow-card-lg hover:-translate-y-1 transition-all duration-300" style={{ animationDelay: `${index * 100}ms` }}>
                      {/* Left Side: Info */}
                      <div className="flex-1 flex flex-col sm:flex-row gap-5">
                        <div className="w-full sm:w-36 h-36 bg-ms-surface2 rounded-ms-sm flex-shrink-0 flex items-center justify-center border border-ms-border overflow-hidden">
                          <svg className="w-12 h-12 text-ms-textDisabled" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                             <span className="bg-brand-tint text-brand text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-semibold border border-brand/20">Government</span>
                             <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-watch bg-watch-tint px-2 py-0.5 rounded-full border border-watch/20">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-watch opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-watch"></span>
                                </span>
                                {facility.status}
                             </span>
                             <span className="flex items-center text-xs font-bold text-amber-500">
                               <svg className="w-3.5 h-3.5 mr-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                               {facility.rating}
                             </span>
                          </div>
                          <h3 className="text-xl font-bold text-ms-textPrimary tracking-tight">{facility.name}</h3>
                          <p className="text-sm text-ms-textSecondary mb-2 font-medium">{facility.type}</p>
                          <div className="flex items-start gap-1.5 text-sm text-ms-textSecondary mb-4">
                             <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-ms-textDisabled" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                             </svg>
                             <span className="line-clamp-2">{facility.location}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                             {facility.services.slice(0,5).map(s => <span key={s} className="text-[11px] font-medium bg-ms-surface2 text-ms-textPrimary px-2.5 py-1 rounded-ms-sm border border-ms-border">{s}</span>)}
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Stats and Actions */}
                      <div className="w-full md:w-64 flex flex-col gap-4 flex-shrink-0 border-t md:border-t-0 md:border-l border-ms-border pt-4 md:pt-0 md:pl-6">
                         <div className="grid grid-cols-2 gap-2">
                           <div className="bg-brand-tint/20 border border-brand/10 p-2.5 rounded-ms-sm">
                             <div className="text-[10px] text-brand uppercase font-bold tracking-wider mb-1 flex items-center gap-1">🛏️ Beds</div>
                             <div className="text-sm font-semibold text-ms-textPrimary">{facility.beds} Available</div>
                           </div>
                           <div className="bg-watch-tint/20 border border-watch/10 p-2.5 rounded-ms-sm">
                             <div className="text-[10px] text-watch uppercase font-bold tracking-wider mb-1 flex items-center gap-1">💊 Medicines</div>
                             <div className="text-sm font-semibold text-ms-textPrimary">{facility.medicines} Stock</div>
                           </div>
                           <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-2.5 rounded-ms-sm">
                             <div className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">👨‍⚕️ Doctors</div>
                             <div className="text-sm font-semibold text-ms-textPrimary">{facility.doctors} Available</div>
                           </div>
                           <div className="bg-purple-50/50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 p-2.5 rounded-ms-sm">
                             <div className="text-[10px] text-purple-600 dark:text-purple-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">🧠 AI Insight</div>
                             <div className="text-[11px] font-medium text-ms-textPrimary leading-tight">{facility.aiInsight}</div>
                           </div>
                         </div>
                         
                         <div className="flex flex-col gap-2 mt-auto">
                            <button className="w-full bg-brand text-white text-sm font-semibold py-2.5 rounded-ms-sm shadow-brand hover:bg-brand-hover transition-all ms-press hover:shadow-brand-lg group-hover:scale-[1.01] flex justify-center items-center gap-1.5">
                              Book Appointment
                            </button>
                            <div className="flex gap-2">
                               <button className="flex-1 bg-transparent border border-ms-border text-ms-textPrimary text-xs font-semibold py-2 rounded-ms-sm hover:border-brand hover:text-brand transition-all ms-press group-hover:scale-[1.01]">Bed Availability</button>
                               <button className="flex-1 bg-transparent border border-ms-border text-ms-textPrimary text-xs font-semibold py-2 rounded-ms-sm hover:border-brand hover:text-brand transition-all ms-press flex items-center justify-center gap-1.5 group-hover:scale-[1.01]">
                                 <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                   <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                 </svg>
                                 Call Now
                               </button>
                            </div>
                         </div>
                       </div>
                    </div>
                  ))}
                  {filteredFacilities.length === 0 && (
                    <div className="py-12 text-center border border-ms-border border-dashed rounded-ms-md">
                      <p className="text-ms-textSecondary">No health centres found matching "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <section className="rounded-ms-md border border-ms-border bg-ms-surface shadow-card transition-all duration-500 ms-fade-rise max-w-3xl mx-auto mb-8">
              <div className="border-b border-ms-border px-5 py-4">
                <h2 className="flex items-center gap-2 font-semibold text-ms-textPrimary">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-brand" aria-hidden="true">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
                  </svg>
                  Ask Vayas AI
                  <span className="ml-auto text-xs text-ms-textDisabled">EN & हिं</span>
                </h2>
              </div>

              <div className="max-h-56 min-h-[80px] overflow-y-auto px-5 py-4 space-y-3">
                {chat.length === 0 && (
                  <p className="text-sm italic text-ms-textDisabled max-w-md">
                    Ask about medicines,<br/>beds,<br/>doctor availability,<br/>vaccination,<br/>or nearby {facilityId === "Private" ? "Private Health Centres" : `${facilityId}s`}...
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
                          ? "bg-brand text-white shadow-md shadow-brand/10"
                          : "border border-ms-border bg-ms-bg text-ms-textPrimary shadow-sm"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {chatBusy && (
                  <div className="flex justify-start ms-fade-rise">
                    <div className="rounded-ms-md border border-ms-border bg-ms-bg px-4 py-3 shadow-sm">
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
                  {(facilityId === "CHC" ? [
                    "Which CHC is nearest?",
                    "Are beds available at CHC Kurali?",
                    "Does CHC Tigaon provide vaccinations?",
                    "Is emergency care available?",
                    "Book appointment at CHC Kheri Kalan"
                  ] : [
                    "Is paracetamol available?",
                    "Which PHC is nearest?",
                    "Are beds available?",
                    "Which doctor is on duty?",
                    "Is vaccination available?"
                  ]).map((suggestion, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setDraft(suggestion);
                        document.getElementById('chat-input')?.focus();
                      }}
                      className="rounded-full border border-ms-border bg-ms-surface px-3 py-1.5 text-xs font-medium text-ms-textPrimary transition-all hover:border-brand hover:text-brand hover:shadow-brand-sm whitespace-nowrap shadow-sm"
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
                    focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 shadow-inner-sm transition-all
                  "
                  style={{ minHeight: "48px" }}
                />
                <button
                  id="chat-send-btn"
                  type="submit"
                  disabled={chatBusy || !draft.trim()}
                  className="
                    ms-press rounded-ms-sm bg-brand px-5 py-3 text-sm font-semibold
                    text-white shadow-brand transition-all hover:bg-brand-hover hover:shadow-brand-lg hover:scale-105
                    disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-brand
                  "
                  style={{ minHeight: "48px" }}
                >
                  {chatBusy ? "..." : t.ask_btn}
                </button>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
