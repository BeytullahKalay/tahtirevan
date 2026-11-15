import type { Metadata } from "next";
import { LOCALES, ROUTES, type Lang, type RouteKey, translatePath } from "./i18n";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://tahtirevan.com").replace(/\/$/, "");

/** Her sayfa için başlık, açıklama, canonical, hreflang ve Open Graph üretir. */
export function pageMeta(
  lang: Lang,
  path: string,
  title: string | null,
  description: string,
): Metadata {
  const tr = lang === "tr" ? path : translatePath(path, "tr");
  const en = lang === "en" ? path : translatePath(path, "en");
  const ogTitle = title ? `${title} · Tahtırevan` : "Tahtırevan · A throne, made for one";
  return {
    ...(title ? { title } : {}),
    description,
    alternates: {
      canonical: path,
      languages: { tr, en, "x-default": tr },
    },
    openGraph: {
      title: ogTitle,
      description,
      url: path,
      siteName: "Tahtırevan",
      locale: LOCALES[lang].ogLocale,
      type: "website",
      images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Tahtırevan" }],
    },
    twitter: { card: "summary_large_image", title: ogTitle, description },
  };
}

export const routeMeta = (lang: Lang, key: RouteKey, title: string | null, description: string) =>
  pageMeta(lang, ROUTES[key][lang], title, description);

/** Sayfa başlıkları ve açıklamaları: iki dil ayrı yazılır. */
export const META = {
  home: {
    tr: [null, "Gövdesi elde yapılan, siparişe ve sahibine göre üretilen koltuk, kanepe ve sedirler. Her parça numaralı ve imzalıdır."],
    en: [null, "Armchairs, sofas and daybeds with hand-built frames, each made to order for one owner. Every piece is numbered and signed."],
  },
  collections: {
    tr: ["Koleksiyonlar", "Bahçe, Fauna, Süsleme ve Rüya: dört desen kodu etrafında kurulan koltuk, kanepe ve sedirler."],
    en: ["Collections", "Garden, Fauna, Ornament and Dream: armchairs, sofas and daybeds built around four pattern codes."],
  },
  bespoke: {
    tr: ["Size Özel", "Özel görüşmeden ömür boyu bakıma kadar, bir Tahtırevan'ın altı adımda yapılışı."],
    en: ["Bespoke", "From a private consultation to lifetime care: how a Tahtırevan is made, in six steps."],
  },
  patterns: {
    tr: ["Desenler", "Tahtırevan desen kütüphanesi: dört desen kodu, on bir kumaş, renk notları, ölçekler ve uygun gövdeler."],
    en: ["Patterns", "The Tahtırevan pattern library: four pattern codes, eleven fabrics, colour notes, scales and suitable frames."],
  },
  story: {
    tr: ["Hikâye", "Yürüyen taht: tahtırevanın tarihteki yeri ve bugün Tahtırevan için ne anlama geldiği."],
    en: ["Story", "The walking throne: the tahtırevan in history, and what it means for Tahtırevan today."],
  },
  consultation: {
    tr: ["Özel Görüşme", "Evinizde ya da video ile özel görüşme talep edin. 24 saat içinde size döneriz."],
    en: ["Private Consultation", "Request a private consultation at your home or by video. We reply within 24 hours."],
  },
} as const;

export const metaFor = (lang: Lang, key: keyof typeof META) =>
  routeMeta(lang, key, META[key][lang][0], META[key][lang][1]);

export const organizationLd = (lang: Lang) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Tahtırevan",
  url: SITE_URL,
  logo: `${SITE_URL}/monogram.svg`,
  slogan: "A throne, made for one.",
  description:
    lang === "tr"
      ? "Gövdesi elde yapılan, siparişe ve sahibine göre üretilen koltuk, kanepe ve sedirler."
      : "Armchairs, sofas and daybeds with hand-built frames, each made to order for one owner.",
});
