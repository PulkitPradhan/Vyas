import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SyncProvider } from "@/lib/offline/sync-provider";
import SyncBanner from "@/components/SyncBanner";

export const metadata: Metadata = {
  title: "MediServ — District PHC/CHC Resource & Early-Warning Platform",
  description:
    "Offline-first resource monitoring and early-warning for Primary Health Centres and Community Health Centres.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MediServ",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 pb-12 text-gray-900">
        <SyncProvider>
          {children}
          <SyncBanner />
        </SyncProvider>
      </body>
    </html>
  );
}
