"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import LangToggle from "@/components/LangToggle";
import SignOutButton from "@/components/SignOutButton";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface NavBarProps {
  staff: { name: string; role: string } | null;
}

export default function NavBar({ staff }: NavBarProps) {
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-ms-surface/80 backdrop-blur-md border-b border-ms-border shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-content items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-ms-sm bg-brand text-white shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M12 12v4M12 8v2M9 12h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-ms-textPrimary">
            {t.login_title}
          </span>
        </div>

        {/* Center Menu (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-semibold text-ms-textPrimary hover:text-brand transition-colors">{t.nav_home}</Link>
          <Link href="/#about" className="text-sm font-semibold text-ms-textSecondary hover:text-brand transition-colors">{t.nav_about}</Link>
          <Link href="/#support" className="text-sm font-semibold text-ms-textSecondary hover:text-brand transition-colors">{t.nav_support}</Link>
          <Link href="/#contact" className="text-sm font-semibold text-ms-textSecondary hover:text-brand transition-colors">{t.nav_contact}</Link>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <LangToggle />
          </div>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          
          {staff ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-ms-textSecondary lg:block">
                {staff.name}
              </span>
              <SignOutButton className="rounded-full border border-ms-border px-4 py-2 text-sm font-semibold text-ms-textSecondary transition-colors hover:border-brand hover:text-brand" />
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-brand transition-all hover:bg-brand-hover active:scale-95"
            >
              {t.nav_staff_signin}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

