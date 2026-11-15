import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/SiteShell";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Tahtırevan · A throne, made for one", template: "%s · Tahtırevan" },
  description: "Armchairs, sofas and daybeds with hand-built frames, each made to order for one owner.",
  icons: { icon: "/monogram.svg" },
};

export const viewport: Viewport = { themeColor: "#14110F", width: "device-width", initialScale: 1 };

export default function EnLayout({ children }: { children: ReactNode }) {
  return <SiteShell lang="en">{children}</SiteShell>;
}
