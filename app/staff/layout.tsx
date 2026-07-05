import Link from "next/link";
import { getCurrentStaff } from "@/lib/auth/context";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const staff = await getCurrentStaff();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <span className="font-semibold">MediServ · Staff</span>
            {staff && (
              <span className="ml-2 text-sm text-gray-500">
                {staff.name} · {staff.facilityName} · {staff.role}
              </span>
            )}
          </div>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            Home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        {!staff ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            Your account is not registered as MediServ staff. Sign out and ask your
            district admin to add you, then sign in again.{" "}
            <a href="/sign-out" className="underline">
              Sign out
            </a>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
