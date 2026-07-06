import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SyncProvider } from "@/lib/offline/sync-provider";
import SyncBanner from "@/components/SyncBanner";

export const metadata: Metadata = {
  title: "Vyas — District PHC/CHC Resource & Early-Warning Platform",
  description:
    "Offline-first resource monitoring and early-warning for Primary Health Centres and Community Health Centres across India.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vyas",
  },
  keywords: ["PHC", "CHC", "health centre", "medicine availability", "district health", "India"],
  authors: [{ name: "Vyas Team" }],
};

export const viewport: Viewport = {
  themeColor: "#0F6E5C",
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
      <head>
        {/* Preconnect for Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-ms-bg font-sans text-ms-textPrimary antialiased">
        <SyncProvider>
          <SyncBanner />
          {children}
        </SyncProvider>
      </body>
    </html>
  );
}
