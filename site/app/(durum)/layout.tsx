import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { serif, sans } from "@/lib/fonts";
import { SITE_URL } from "@/lib/seo";
import "./durum.css";

/** "Yakında" ve "Bakımdayız" sayfasının kendi kök düzeni: üst menü, alt bilgi ve çerez çubuğu yok. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  robots: { index: false, follow: false },
  icons: { icon: "/brand/icon.svg", apple: "/brand/apple-touch-icon.png" },
};

export const viewport: Viewport = { themeColor: "#14110F", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function DurumLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <body className="gate">{children}</body>
    </html>
  );
}
