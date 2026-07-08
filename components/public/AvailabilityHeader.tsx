"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import LangToggle from "@/components/LangToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AvailabilityHeader() {
  const { t } = useLanguage();
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

  return (
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
  );
}
