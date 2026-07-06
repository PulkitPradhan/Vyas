import Link from "next/link";
import { getCurrentStaff } from "@/lib/auth/context";
import ThemeToggle from "@/components/ThemeToggle";
import LangToggle from "@/components/LangToggle";
import LandingStoryClient from "@/components/LandingStoryClient";
import SignOutButton from "@/components/SignOutButton";

// Force dynamic — auth lookup is server-side
export const dynamic = "force-dynamic";

export default async function RootPage() {
  const staff = await getCurrentStaff();

  return (
    <div className="min-h-screen bg-ms-bg">
      {/* ── Fixed top nav ── */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-ms-border bg-ms-surface/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-ms-sm bg-brand text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M12 12v4M12 8v2M9 12h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-base font-semibold tracking-tight text-ms-textPrimary">
              Vyas
            </span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {staff ? (
              <span className="hidden text-sm text-ms-textSecondary sm:block">
                {staff.name} · {staff.role}
              </span>
            ) : null}
            <LangToggle />
            <ThemeToggle />
            {staff ? (
              <SignOutButton className="rounded-ms-sm border border-ms-border px-3 py-2 text-sm font-medium text-ms-textSecondary transition-colors hover:border-brand hover:text-brand" />
            ) : (
              <Link
                href="/login"
                className="rounded-ms-sm bg-brand px-4 py-2 text-sm font-semibold text-white shadow-brand transition-all hover:bg-brand-hover active:scale-95"
              >
                Staff Sign-in
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Story sections (client for scroll-reveal) ── */}
      <LandingStoryClient staff={staff ? { name: staff.name, role: staff.role } : null} />
    </div>
  );
}
