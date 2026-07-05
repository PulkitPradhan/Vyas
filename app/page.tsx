import Link from "next/link";
import { getCurrentStaff } from "@/lib/auth/context";

// The root page does a server-side auth lookup (to show staff identity vs a
// sign-in link), so it cannot be statically prerendered against an env-less
// build sandbox — mark it dynamic.
export const dynamic = "force-dynamic";

export default async function RootPage() {
  const staff = await getCurrentStaff();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 p-6 text-center">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">MediServ</h1>
        <p className="mt-2 text-lg text-gray-600">
          District PHC/CHC Resource & Early-Warning Platform
        </p>
      </div>

      <p className="max-w-xl text-sm text-gray-500">
        Offline-first resource monitoring. Pick an entry point below — staff
        routes are role-gated, the public lookup needs no login.
      </p>

      <nav className="grid w-full gap-3 sm:grid-cols-2">
        <Link
          href="/staff"
          className="rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-gray-400"
        >
          <span className="block font-semibold">Staff</span>
          <span className="block text-sm text-gray-500">
            Nurse / pharmacist data entry
          </span>
        </Link>
        <Link
          href="/doctor"
          className="rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-gray-400"
        >
          <span className="block font-semibold">Doctor</span>
          <span className="block text-sm text-gray-500">
            Attendance check-in / out
          </span>
        </Link>
        <Link
          href="/admin"
          className="rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-gray-400"
        >
          <span className="block font-semibold">District Admin</span>
          <span className="block text-sm text-gray-500">
            Live flagged-centre dashboard
          </span>
        </Link>
        <Link
          href="/public"
          className="rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-gray-400"
        >
          <span className="block font-semibold">Public Lookup</span>
          <span className="block text-sm text-gray-500">
            No login — medicine / bed / doctor availability
          </span>
        </Link>
      </nav>

      <div className="text-sm text-gray-500">
        {staff ? (
          <span>
            Signed in as {staff.name} ({staff.role}).{" "}
            <a href="/sign-out" className="underline">
              Sign out
            </a>
          </span>
        ) : (
          <a href="/login" className="underline">
            Staff sign-in
          </a>
        )}
      </div>
    </main>
  );
}
