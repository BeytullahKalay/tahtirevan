import type { Metadata } from "next";
import { LOCALES, ROUTES, type Lang, type RouteKey, type SlugMap, translatePath } from "./i18n";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://tahtirevan.com").replace(/\/$/, "");

/** Her sayfa için başlık, açıklama, canonical, hreflang ve Open Graph üretir. */
export function pageMeta(
  lang: Lang,
  path: string,
  title: string | null,
  description: string,
  /** Koleksiyon/parça sayfalarında diğer dilin adresini bulmak için. */
  slugs?: SlugMap,
): Metadata {
  const tr = lang === "tr" ? path : translatePath(path, "tr", slugs);
  const en = lang === "en" ? path : translatePath(path, "en", slugs);
  const ogTitle = title
    ? `${title} · Tahtırevan`
    : lang === "tr"
      ? "Tahtırevan · Bir taht, tek bir kişi için"
      : "Tahtırevan · A throne, made for one";
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
    tr: [null, "Siparişle, sahibine göre yapılan koltuk ve sedirler. Kumaştan doğan biçimler; nakış, püskül ve pirinç damga."],
    en: [null, "Armchairs and daybeds made to order, for one owner. Forms born of the fabric; embroidery, a tassel and a brass seal."],
  },
  collections: {
    tr: ["Koleksiyonlar", "Kuruluş serisi ve yolun durakları: siparişle yapılan, numaralı parçalar."],
    en: ["Collections", "The founding series and the stops on the road: numbered pieces, made to order."],
  },
  bespoke: {
    tr: ["Size Özel", "Özel görüşmeden ömür boyu bakıma kadar, bir Tahtırevan'ın altı adımda yapılışı."],
    en: ["Bespoke", "From a private consultation to lifetime care: how a Tahtırevan is made, in six steps."],
  },
  patterns: {
    tr: ["Desenler", "Tahtırevan desen kütüphanesi: dört desen kodu, on bir kumaş, renk notları, ölçekler ve bu kumaşlarla düşünülmüş etütler."],
    en: ["Patterns", "The Tahtırevan pattern library: four pattern codes, eleven fabrics, colour notes, scales and the studies imagined in them."],
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
  logo: `${SITE_URL}/brand/logo-512.png`,
  slogan: lang === "tr" ? "Bir taht, tek bir kişi için." : "A throne, made for one.",
  description:
    lang === "tr"
      ? "Siparişle, sahibine göre yapılan koltuk ve sedirler."
      : "Armchairs and daybeds made to order, for one owner.",
});
