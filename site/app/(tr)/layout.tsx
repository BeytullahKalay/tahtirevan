import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/SiteShell";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Tahtırevan · Her taht, sahibini bekler", template: "%s · Tahtırevan" },
  description: "Gövdesi elde yapılan, siparişe ve sahibine göre üretilen koltuk, kanepe ve sedirler.",
  icons: { icon: "/brand/icon.svg", apple: "/brand/apple-touch-icon.png" },
};

export const viewport: Viewport = { themeColor: "#14110F", width: "device-width", initialScale: 1 };

export default function TrLayout({ children }: { children: ReactNode }) {
  return <SiteShell lang="tr">{children}</SiteShell>;
}
