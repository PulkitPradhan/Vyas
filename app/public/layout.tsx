import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

// Public layout — no auth required, deliberately minimal chrome.
// The pill navbar lives inside PatientLookupClient (per UI&UX.md §5).
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen min-h-dvh bg-ms-bg">

      {children}
    </div>
  );
}
