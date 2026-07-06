"use client";

import Link from "next/link";
import { useEffect, useRef, useState, MouseEvent } from "react";

interface Props {
  staff: { name: string; role: string } | null;
}

const ROLE_TILES = [
  {
    href: "/staff",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    label: "Staff",
    sublabel: "Nurse / Pharmacist",
    desc: "Update stock, beds & patient footfall",
    color: "brand",
    badge: "Role-gated",
  },
  {
    href: "/doctor",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M17 13.5v3M15.5 15H18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    label: "Doctor",
    sublabel: "Medical Officer",
    desc: "Geo-tagged check-in & attendance record",
    color: "watch",
    badge: "Role-gated",
  },
  {
    href: "/admin",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M14 17.5h7M17.5 14v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    label: "District Admin",
    sublabel: "Health Officer",
    desc: "Live flagged-centre dashboard & AI redistribution",
    color: "warning",
    badge: "Admin only",
  },
  {
    href: "/public",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M20 20l-2.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    label: "Public Lookup",
    sublabel: "No login needed",
    desc: "Medicine · Beds · Doctors — available right now",
    color: "critical",
    badge: "Open access",
  },
];

const STATS = [
  { number: "< 5s", label: "per field update" },
  { number: "100%", label: "offline-first" },
  { number: "EN + हिं", label: "bilingual AI" },
  { number: "Live", label: "real-time flags" },
];

const HOW_STEPS = [
  {
    step: "01",
    title: "Staff logs in seconds",
    body: "Pharmacists update stock via voice or tap. Nurses toggle beds. Doctors geo-check in — all in under 5 seconds, with or without signal.",
  },
  {
    step: "02",
    title: "AI detects problems early",
    body: "Rolling stock projections, bed-occupancy thresholds, and attendance gaps are computed every minute and tiered by severity.",
  },
  {
    step: "03",
    title: "Admin sees live flags",
    body: "District health officers see real-time flagged centres with one-line plain-language explanations in English & Hindi — and actionable redistribution suggestions.",
  },
  {
    step: "04",
    title: "Citizens check before they travel",
    body: "A zero-login public page answers \"Is paracetamol available at PHC Rampur right now?\" — no wasted trips.",
  },
];

const colorMap: Record<string, string> = {
  brand:    "text-brand bg-brand-tint border-brand-light hover:border-brand",
  watch:    "text-watch bg-watch-tint border-[#B8E2CA] hover:border-watch",
  warning:  "text-warning bg-warning-tint border-[#E8C97A] hover:border-warning",
  critical: "text-critical bg-critical-tint border-[#EDB3B3] hover:border-critical",
};

const shadowMap: Record<string, string> = {
  brand:    "hover:shadow-brand",
  watch:    "hover:shadow-[0_4px_20px_rgba(46,139,87,0.2)]",
  warning:  "hover:shadow-[0_4px_20px_rgba(201,138,31,0.2)]",
  critical: "hover:shadow-[0_4px_20px_rgba(214,69,69,0.2)]",
};

export default function LandingStoryClient({ staff }: Props) {
  const [mounted, setMounted] = useState(false);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  // Mark mounted so we can run scroll-reveal without hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Intersection observer for scroll-reveal (below-fold sections)
  useEffect(() => {
    if (!mounted) return;
    const cards = document.querySelectorAll(".js-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target); // fire once
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    cards.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [mounted]);

  // 3D Tilt Effect on mouse move for cards (Hardware Accelerated)
  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    // Only apply on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2; // -1 to 1
    // Max rotation 4deg for subtlety
    e.currentTarget.style.transform = `perspective(1000px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = (e: MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = "";
  };

  return (
    <>


      <main className="pt-[57px] overflow-x-hidden">

        {/* ══════════════════════════════
            HERO — always visible
        ══════════════════════════════ */}
        <section
          className="relative flex min-h-[92svh] flex-col items-center justify-center px-4 py-20 text-center sm:py-28"
          ref={(el) => { sectionRefs.current[0] = el; }}
        >
          {/* Subtle teal radial glow behind hero */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(227,243,239,0.9) 0%, transparent 65%)",
            }}
            aria-hidden="true"
          />
          {/* Grid dot pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle, #0F6E5C 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
            aria-hidden="true"
          />

          {/* Floating decorative elements */}
          <div className="absolute top-[20%] left-[10%] hidden lg:block opacity-40 animate-float" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <div className="absolute top-[30%] right-[10%] hidden lg:block opacity-40 animate-float-delayed" aria-hidden="true">
             <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-watch">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
             </svg>
          </div>

          <div className="relative mx-auto max-w-3xl z-10">
            {/* Eyebrow */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-light bg-brand-tint px-4 py-2 text-sm font-semibold text-brand shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand"></span>
              </span>
              Offline-first · AI-powered · Real-time
            </div>

            <h1 className="mb-6 text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-[1.1] tracking-tight text-ms-textPrimary">
              District health ops,{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #0F6E5C 0%, #1A9B82 50%, #0A5548 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                actually working
              </span>
            </h1>

            <p className="hero-animate hero-d3 mx-auto mb-10 max-w-xl text-[clamp(1rem,2vw,1.2rem)] leading-relaxed text-ms-textSecondary">
              Vyas surfaces stock-outs, bed crises, and doctor absences{" "}
              <strong className="font-semibold text-ms-textPrimary">
                before a patient is turned away
              </strong>{" "}
              — in real time, in English and Hindi, on any phone, even offline.
            </p>

            {/* CTAs */}
            <div className="hero-animate hero-d4 flex flex-wrap items-center justify-center gap-4">
              {staff ? (
                <Link
                  href={
                    staff.role === "admin" ? "/admin"
                    : staff.role === "doctor" ? "/doctor"
                    : "/staff"
                  }
                  className="rounded-ms-md bg-brand px-8 py-4 text-base font-bold text-white shadow-brand transition-all duration-300 hover:bg-brand-hover hover:shadow-lg active:scale-95"
                >
                  Go to your dashboard →
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="rounded-ms-md bg-brand px-8 py-4 text-base font-bold text-white shadow-brand transition-all duration-300 hover:bg-brand-hover hover:shadow-[0_8px_30px_rgba(15,110,92,0.3)] active:scale-95"
                >
                  Staff Sign-in
                </Link>
              )}
              <Link
                href="/public"
                className="rounded-ms-md border border-ms-border bg-ms-surface px-8 py-4 text-base font-bold text-ms-textPrimary shadow-card transition-all duration-300 hover:border-brand hover:text-brand hover:shadow-[0_8px_30px_rgba(15,110,92,0.15)] active:scale-95"
              >
                Check availability — no login
              </Link>
            </div>

            {/* Auth context chip */}
            {staff && (
              <p className="hero-animate hero-d4 mt-6 text-sm text-ms-textSecondary">
                Signed in as <strong className="text-ms-textPrimary">{staff.name}</strong> ({staff.role}) ·{" "}
                <a href="/sign-out" className="text-brand underline underline-offset-2 hover:text-brand-hover">
                  Sign out
                </a>
              </p>
            )}
          </div>

          {/* Scroll hint */}
          <div className="hero-animate hero-d4 absolute bottom-6 left-1/2 -translate-x-1/2 text-ms-textDisabled" aria-hidden="true">
            <div className="animate-bounce">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            STATS BAR
        ══════════════════════════════ */}
        <section className="border-y border-ms-border bg-ms-surface px-4 py-12 relative z-10">
          <div className="mx-auto grid max-w-content grid-cols-2 gap-8 sm:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={i}
                className={`js-reveal js-reveal-d${i + 1} text-center`}
              >
                <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-black tabular-nums text-brand drop-shadow-sm">
                  {s.number}
                </p>
                <p className="mt-2 text-sm font-medium text-ms-textSecondary uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════
            PATIENT BANNER — prominent "no login" entry
        ══════════════════════════════ */}
        <section className="px-4 py-12 bg-brand-tint border-b border-brand-light relative z-10">
          <div className="mx-auto max-w-content">
            <Link
              href="/public"
              className="js-reveal tilt-card group flex flex-col sm:flex-row items-center justify-between gap-6 rounded-ms-lg border border-brand-light bg-ms-surface p-6 shadow-brand active:scale-[0.99]"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-ms-md bg-brand text-white shadow-[0_4px_20px_rgba(15,110,92,0.3)] transition-transform duration-300 group-hover:scale-105">
                  <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M17 8C17 11.866 13.866 15 10 15C6.13401 15 3 11.866 3 8C3 4.13401 6.13401 1 10 1C13.866 1 17 4.13401 17 8Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M10 15V23M6 21H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M19 5H22M20.5 3.5V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-ms-textPrimary group-hover:text-brand transition-colors">Check medicine &amp; bed availability</p>
                  <p className="mt-1 text-sm text-ms-textSecondary max-w-xl">
                    No login · No account · Works in Hindi &amp; English · Find the nearest PHC with what you need instantly.
                  </p>
                </div>
              </div>
              <span className="flex flex-shrink-0 items-center gap-2 rounded-ms-sm bg-brand px-6 py-3.5 font-bold text-white shadow-brand transition-all group-hover:bg-brand-hover">
                Open lookup
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true">
                  <path fillRule="evenodd" d="M2 8a.75.75 0 01.75-.75h8.69L8.22 4.03a.75.75 0 011.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 01-1.06-1.06l3.22-3.22H2.75A.75.75 0 012 8z" clipRule="evenodd"/>
                </svg>
              </span>
            </Link>
          </div>
        </section>

        {/* ══════════════════════════════
            ROLE TILES
        ══════════════════════════════ */}
        <section className="px-4 py-20" ref={(el) => { sectionRefs.current[2] = el; }}>
          <div className="mx-auto max-w-content">
            <div className="js-reveal mb-12 text-center">
              <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold tracking-tight text-ms-textPrimary">
                One platform, every role
              </h2>
              <p className="mt-3 text-lg text-ms-textSecondary">
                Staff routes require a phone OTP sign-in. Patient lookup is open to all.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {ROLE_TILES.map((tile, i) => (
                <Link
                  key={tile.href}
                  href={tile.href}
                  id={`role-tile-${tile.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`
                    js-reveal js-reveal-d${i + 1} tilt-card group relative flex flex-col gap-4 rounded-ms-lg
                    border border-ms-border bg-ms-surface p-6 shadow-card
                    ${shadowMap[tile.color]} active:scale-[0.98] tap-target
                  `}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <span className={`inline-flex h-14 w-14 items-center justify-center rounded-ms-sm border bg-ms-surface transition-transform duration-300 group-hover:scale-110 ${colorMap[tile.color]}`}>
                    {tile.icon}
                  </span>

                  <div className="flex-1 mt-2">
                    <p className="text-lg font-bold text-ms-textPrimary">{tile.label}</p>
                    <p className="text-sm font-medium text-ms-textSecondary">{tile.sublabel}</p>
                  </div>

                  <p className="text-sm leading-relaxed text-ms-textSecondary">{tile.desc}</p>

                  <div className="mt-2 flex items-center justify-between border-t border-ms-border pt-4">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${colorMap[tile.color]}`}>
                      {tile.badge}
                    </span>
                    <span className="text-ms-textDisabled transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            HOW IT WORKS
        ══════════════════════════════ */}
        <section className="bg-ms-surface px-4 py-20 border-y border-ms-border relative overflow-hidden" ref={(el) => { sectionRefs.current[3] = el; }}>
          <div className="mx-auto max-w-content relative z-10">
            <div className="js-reveal mb-14 text-center">
              <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold tracking-tight text-ms-textPrimary">
                How it works
              </h2>
              <p className="mt-3 text-lg text-ms-textSecondary">From data entry to district action in minutes.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {HOW_STEPS.map((step, i) => (
                <div
                  key={i}
                  className={`js-reveal js-reveal-d${i + 1} tilt-card flex gap-5 rounded-ms-lg border border-ms-border bg-ms-bg p-8 transition-colors duration-300 hover:border-brand-light hover:shadow-brand`}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <span className="mt-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-ms-md bg-brand text-lg font-black text-white shadow-sm">
                    {step.step}
                  </span>
                  <div>
                    <p className="text-xl font-bold text-ms-textPrimary">{step.title}</p>
                    <p className="mt-3 text-base leading-relaxed text-ms-textSecondary">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            ARCHITECTURE & SECURITY (New Text Section)
        ══════════════════════════════ */}
        <section className="px-4 py-20 bg-ms-bg">
          <div className="mx-auto max-w-content">
            <div className="js-reveal mb-12 text-center">
              <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold tracking-tight text-ms-textPrimary">
                Enterprise architecture for the edge
              </h2>
              <p className="mt-3 text-lg text-ms-textSecondary max-w-2xl mx-auto">
                Built specifically for the constraints of rural healthcare infrastructure.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="js-reveal js-reveal-d1 rounded-ms-lg border border-ms-border bg-ms-surface p-6 shadow-sm">
                 <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-ms-sm bg-watch-tint text-watch">
                   <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="2">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                   </svg>
                 </div>
                 <h3 className="text-lg font-bold text-ms-textPrimary mb-2">Offline-First Queueing</h3>
                 <p className="text-sm text-ms-textSecondary leading-relaxed">
                   Leverages IndexedDB via Dexie.js. If a pharmacist updates stock while offline, the mutation is queued locally and automatically syncs to the server the moment connectivity returns, guaranteeing zero data loss.
                 </p>
              </div>

              <div className="js-reveal js-reveal-d2 rounded-ms-lg border border-ms-border bg-ms-surface p-6 shadow-sm">
                 <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-ms-sm bg-brand-tint text-brand">
                   <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="2">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                   </svg>
                 </div>
                 <h3 className="text-lg font-bold text-ms-textPrimary mb-2">Role-Level Security (RLS)</h3>
                 <p className="text-sm text-ms-textSecondary leading-relaxed">
                   Powered by Supabase PostgreSQL RLS. Staff can only read and mutate data belonging to their assigned facility. District Admins are strictly scoped to facilities within their district bounds.
                 </p>
              </div>

              <div className="js-reveal js-reveal-d3 rounded-ms-lg border border-ms-border bg-ms-surface p-6 shadow-sm">
                 <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-ms-sm bg-warning-tint text-warning">
                   <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="2">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                   </svg>
                 </div>
                 <h3 className="text-lg font-bold text-ms-textPrimary mb-2">Highly Optimized PWA</h3>
                 <p className="text-sm text-ms-textSecondary leading-relaxed">
                   Installable directly from the browser on iOS and Android. Minimal JS bundle size, fluid clamp-based typography scaling, and hardware-accelerated animations ensure a 95+ Lighthouse score even on budget devices.
                 </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            PROBLEM / SOLUTION
        ══════════════════════════════ */}
        <section className="px-4 py-20 border-t border-ms-border" ref={(el) => { sectionRefs.current[4] = el; }}>
          <div className="mx-auto max-w-content">
            <div className="js-reveal mb-12 text-center">
              <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold tracking-tight text-ms-textPrimary">
                Built for the problem, not the boardroom
              </h2>
            </div>
            <div className="grid items-start gap-8 lg:grid-cols-2">
              <div className="js-reveal tilt-card rounded-ms-lg border-2 border-[#EDB3B3] bg-critical-tint p-8 shadow-sm" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                <div className="mb-5 flex items-center gap-3 text-critical">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-critical text-white">
                    <svg viewBox="0 0 16 16" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-xl font-bold">The problem today</span>
                </div>
                <ul className="space-y-4">
                  {["Stock-outs found when a patient asks — not before", "Empty beds nobody outside the facility knows about", "Doctor absences logged on paper, disputed later", "District admin sees problems via weekly paper reports"].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-base text-ms-textPrimary font-medium">
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-critical shadow-[0_0_8px_rgba(214,69,69,0.6)]" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="js-reveal tilt-card rounded-ms-lg border-2 border-[#B8E2CA] bg-watch-tint p-8 shadow-sm" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                <div className="mb-5 flex items-center gap-3 text-watch">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-watch text-white">
                    <svg viewBox="0 0 16 16" fill="currentColor" className="h-6 w-6" aria-hidden="true">
                      <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm11.78-2.72a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-2-2a.75.75 0 111.06-1.06l1.47 1.47 3.97-3.97a.75.75 0 011.06 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-xl font-bold">Vyas solves it</span>
                </div>
                <ul className="space-y-4">
                  {["Voice or tap stock updates in under 5 seconds", "One-tap bed toggle, visible district-wide instantly", "Geo-tagged doctor check-in, real-time attendance", "AI flags problems before they become crises"].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-base text-ms-textPrimary font-medium">
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-watch shadow-[0_0_8px_rgba(46,139,87,0.6)]" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            AUTH INFO SECTION
        ══════════════════════════════ */}
        <section className="bg-ms-surface border-t border-ms-border px-4 py-16">
          <div className="mx-auto max-w-content">
            <div className="js-reveal mb-12 text-center">
              <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold tracking-tight text-ms-textPrimary">
                Who logs in — and how
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  icon: "📱",
                  title: "Field Staff",
                  subtitle: "Nurse, Pharmacist, Doctor",
                  body: "Phone OTP or Google account. Your district admin adds you to the system — then just tap Sign-in.",
                  cta: { label: "Staff Sign-in", href: "/login" },
                  color: "brand",
                },
                {
                  icon: "🏛️",
                  title: "District Admin",
                  subtitle: "Health Officer",
                  body: "Same /login page — phone OTP or Google. Admin role is provisioned in Supabase by the system manager. No separate signup.",
                  cta: { label: "Admin Login", href: "/login" },
                  color: "warning",
                },
                {
                  icon: "👤",
                  title: "Patient / Citizen",
                  subtitle: "Public Lookup",
                  body: "Zero login. Zero account. Just open the Public Lookup and check availability at any PHC near you.",
                  cta: { label: "Open Lookup", href: "/public" },
                  color: "watch",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className={`js-reveal js-reveal-d${i + 1} tilt-card rounded-ms-lg border border-ms-border bg-ms-bg p-8 flex flex-col gap-4 shadow-sm hover:border-${card.color} hover:shadow-${card.color}`}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <span className="text-4xl mb-2" aria-hidden="true">{card.icon}</span>
                  <div>
                    <p className="text-xl font-bold text-ms-textPrimary">{card.title}</p>
                    <p className="text-sm font-medium text-ms-textDisabled mt-1">{card.subtitle}</p>
                    <p className="mt-4 text-base leading-relaxed text-ms-textSecondary">{card.body}</p>
                  </div>
                  <Link
                    href={card.cta.href}
                    className={`mt-auto inline-flex items-center gap-1.5 text-base font-bold text-${card.color} underline-offset-4 hover:underline`}
                  >
                    {card.cta.label} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            FINAL CTA
        ══════════════════════════════ */}
        <section className="border-t border-ms-border bg-brand px-4 py-24 text-center relative overflow-hidden" ref={(el) => { sectionRefs.current[5] = el; }}>
           {/* Abstract shape */}
           <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white opacity-5 blur-3xl pointer-events-none" aria-hidden="true" />
           <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-brand-hover opacity-50 blur-3xl pointer-events-none" aria-hidden="true" />
           
          <div className="mx-auto max-w-2xl relative z-10">
            <h2 className="mb-4 text-[clamp(2rem,4vw,3rem)] font-black text-white leading-tight">
              Works on ₹6,000 phones in bright sunlight.
            </h2>
            <p className="mb-10 text-lg text-brand-tint opacity-90">
              Offline queue ensures no data is ever lost — even on 2G networks. Start checking resources instantly.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/public"
                className="rounded-ms-md bg-white px-8 py-4 text-lg font-bold text-brand shadow-lg transition-all duration-300 hover:bg-brand-tint hover:shadow-xl active:scale-95"
              >
                Try public lookup — no login
              </Link>
              {!staff && (
                <Link
                  href="/login"
                  className="rounded-ms-md border-2 border-white/40 px-8 py-4 text-lg font-bold text-white transition-all duration-300 hover:bg-white/10 hover:border-white active:scale-95"
                >
                  Staff sign-in
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-ms-border px-4 py-10 text-center text-sm text-ms-textDisabled bg-ms-surface">
          <p className="font-medium text-ms-textSecondary">Vyas — District PHC/CHC Resource & Early-Warning Platform</p>
          <p className="mt-2">Built for India's primary healthcare system · Offline-first · Open source</p>
        </footer>
      </main>
    </>
  );
}
