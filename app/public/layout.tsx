import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  // No auth, no header chrome that implies login — deliberately minimal per ADR-008.
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-semibold">MediServ · Public</span>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            Home
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
