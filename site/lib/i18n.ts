
/**
 * Diller. Arapça (dir: "rtl") ve Rusça eklemek için buraya bir giriş,
 * ROUTES içine çeviri yolları ve içerik JSON'larına yeni alanlar eklemek yeterlidir.
 */
export const LOCALES = {
  tr: { htmlLang: "tr", dir: "ltr", label: "TR", ogLocale: "tr_TR" },
  en: { htmlLang: "en", dir: "ltr", label: "EN", ogLocale: "en_GB" },
} as const;

export type Lang = keyof typeof LOCALES;
export const LANGS = Object.keys(LOCALES) as Lang[];

export const ROUTES = {
  home: { tr: "/", en: "/en" },
  studies: { tr: "/etutler", en: "/en/studies" },
  collections: { tr: "/koleksiyonlar", en: "/en/collections" },
  bespoke: { tr: "/size-ozel", en: "/en/bespoke" },
  patterns: { tr: "/desenler", en: "/en/patterns" },
  story: { tr: "/hikaye", en: "/en/story" },
  consultation: { tr: "/gorusme", en: "/en/consultation" },
  privacy: { tr: "/gizlilik", en: "/en/privacy" },
  cookies: { tr: "/cerezler", en: "/en/cookies" },
  care: { tr: "/bakim", en: "/en/care" },
  press: { tr: "/basin", en: "/en/press" },
} as const;

export type RouteKey = keyof typeof ROUTES;

export const href = (lang: Lang, key: RouteKey) => ROUTES[key][lang];

type Slugged = { slug: { tr: string; en: string } };

export const collectionHref = (lang: Lang, col: Slugged) =>
  `${ROUTES.collections[lang]}/${col.slug[lang]}`;

/** Parça adresi: parça, koleksiyonunun bağlantı parçasını (`colSlug`) yanında taşır. */
export const pieceHref = (lang: Lang, piece: Slugged & { colSlug: { tr: string; en: string } }) =>
  `${ROUTES.collections[lang]}/${piece.colSlug[lang]}/${piece.slug[lang]}`;

/** Kumaş sayfası: adres kumaşın kalıcı kod adıyla kurulur, iki dilde aynıdır (/desenler/mayura · /en/patterns/mayura). */
export const fabricHref = (lang: Lang, fabricId: string) => `${ROUTES.patterns[lang]}/${fabricId}`;

/** Koleksiyon ve parça bağlantı parçaları (katalogdan gelir: `catalog.slugs`). */
export type SlugMap = {
  collections: { id: string; slug: { tr: string; en: string } }[];
  pieces: { collection: string; slug: { tr: string; en: string } }[];
};

/** Verilen yolun diğer dildeki karşılığını bulur (dil seçici ve hreflang için). */
export function translatePath(pathname: string, to: Lang, slugs?: SlugMap): string {
  const clean = pathname.replace(/\/+$/, "") || "/";
  const from: Lang = clean === "/en" || clean.startsWith("/en/") ? "en" : "tr";

  for (const key of Object.keys(ROUTES) as RouteKey[]) {
    if (ROUTES[key][from] === clean) return ROUTES[key][to];
  }

  const patterns = ROUTES.patterns[from];
  if (clean.startsWith(patterns + "/")) return fabricHref(to, clean.slice(patterns.length + 1).split("/")[0]);

  const base = ROUTES.collections[from];
  if (clean.startsWith(base + "/")) {
    if (!slugs) return ROUTES.collections[to];
    const [colSlug, pieceSlug] = clean.slice(base.length + 1).split("/");
    const col = slugs.collections.find((c) => c.slug[from] === colSlug);
    if (!col) return ROUTES.collections[to];
    if (!pieceSlug) return collectionHref(to, col);
    const piece = slugs.pieces.find((p) => p.collection === col.id && p.slug[from] === pieceSlug);
    return piece ? `${collectionHref(to, col)}/${piece.slug[to]}` : collectionHref(to, col);
  }
  return ROUTES.home[to];
}

export const UI = {
  tr: {
    skip: "İçeriğe geç",
    nav: {
      studies: "Etütler",
      collections: "Koleksiyonlar",
      patterns: "Desenler",
      bespoke: "Size Özel",
      story: "Hikâye",
    },
    /** Mobil menüde her bağlantının altında, sayfanın ne olduğunu anlatan kısa satır. */
    navHint: {
      studies: "Kumaşla düşünülmüş gövdeler",
      patterns: "Kumaş kütüphanesi",
      collections: "Kuruluş serisi",
      bespoke: "Bir parça nasıl yapılır",
      story: "Yol ve duraklar",
    },
    consult: "Özel görüşme",
    menu: "Menü",
    close: "Kapat",
    explore: "Keşfet",
    placeholder: "Yer tutucu görsel",
    langName: "Türkçe",
    footer: {
      invite: "Bir parça mı düşünüyorsunuz?",
      inviteLine: "Gövdeyi, ölçüyü ve kumaşı birlikte seçeriz. Her parça siparişle, sahibi için yapılır.",
      privacy: "Gizlilik ve KVKK",
      cookies: "Çerez politikası",
      care: "Bakım kılavuzu",
      press: "Basın",
      language: "Dil",
      follow: "Takip edin",
      rights: "Her parça siparişle yapılır ve numaralıdır.",
    },
    consent: {
      text: "Ziyaretleri anlamak için çerez kullanmayan, gizlilik dostu bir ölçüm aracı kullanmak istiyoruz.",
      accept: "Kabul et",
      decline: "Hayır, teşekkürler",
      more: "Ayrıntılar",
    },
  },
  en: {
    skip: "Skip to content",
    nav: {
      studies: "Studies",
      collections: "Collections",
      patterns: "Patterns",
      bespoke: "Bespoke",
      story: "Story",
    },
    navHint: {
      studies: "Bodies imagined in our fabrics",
      patterns: "The fabric library",
      collections: "The founding series",
      bespoke: "How a piece is made",
      story: "The road and its stops",
    },
    consult: "Private consultation",
    menu: "Menu",
    close: "Close",
    explore: "Explore",
    placeholder: "Placeholder image",
    langName: "English",
    footer: {
      invite: "Thinking of a piece?",
      inviteLine: "We choose the body, the size and the fabric together. Every piece is made to order, for its owner.",
      privacy: "Privacy",
      cookies: "Cookie policy",
      care: "Care guide",
      press: "Press",
      language: "Language",
      follow: "Follow",
      rights: "Every piece is made to order and numbered.",
    },
    consent: {
      text: "We would like to use a privacy-friendly, cookie-free tool to understand how the site is visited.",
      accept: "Accept",
      decline: "No, thank you",
      more: "Details",
    },
  },
} as const;
