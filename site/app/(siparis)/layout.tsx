import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { serif, sans } from "@/lib/fonts";
import { SITE_URL } from "@/lib/seo";
import "@/app/globals.css";

/**
 * Reklam testinin sipariş sayfaları için kendi kök düzeni: üst menü, açılış animasyonu ve alt bilgi yok.
 * Reklamdan gelen ziyaretçi doğrudan ürünü, fiyatı ve "Sipariş ver"i görsün. Site "Yakında" modundayken
 * de açıktır (proxy.ts). Arama motorlarına kapalı.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  robots: { index: false, follow: false },
  icons: { icon: "/brand/icon.svg", apple: "/brand/apple-touch-icon.png" },
};

export const viewport: Viewport = { themeColor: "#14110F", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function SiparisLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
