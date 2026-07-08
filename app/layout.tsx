import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { SyncProvider } from "@/lib/offline/sync-provider";
import SyncBanner from "@/components/SyncBanner";
import { MotionProvider } from "@/components/MotionProvider";

// Self-hosted via next/font: no render-blocking external stylesheet, fonts are
// served same-origin with `font-display: swap` and preloaded automatically.
// Exposed as CSS variables consumed by Tailwind + globals.css.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-devanagari",
  display: "swap",
});

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
  // No maximumScale — clamping zoom is a WCAG 1.4.4 violation (users with low
  // vision must be able to zoom to at least 200%).
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${notoDevanagari.variable}`}>
      <body className="min-h-screen bg-ms-bg font-sans text-ms-textPrimary antialiased">
        <LanguageProvider>
          <SyncProvider>
            <SyncBanner />
            <MotionProvider>
              {children}
            </MotionProvider>
          </SyncProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
