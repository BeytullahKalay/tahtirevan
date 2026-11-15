import { fabrics } from "./content";
import type { Lang } from "./i18n";

/**
 * Geçici görsel kütüphanesi: tek bir ürün fotoğrafı (Serir, Rossaria sırtlı) ve
 * GRAND kataloğundan kesilen kumaş görselleri. Gerçek çekimler geldiğinde
 * yalnızca bu dosya ve `public/` güncellenir.
 */

/** Arka planı temizlenmiş ürün fotoğrafı (şeffaf PNG). */
export const CHAIR = { src: "/chair/serir.png", width: 1009, height: 1128 };

/** Aynı fotoğraftan makro kırpımlar. */
export const DETAILS = [
  {
    src: "/chair/details/back.jpg",
    width: 300,
    height: 375,
    alt: { tr: "Rossaria kumaşlı sırtın yakın çekimi", en: "Close-up of the Rossaria back" },
  },
  {
    src: "/chair/details/arch.jpg",
    width: 310,
    height: 387,
    alt: { tr: "Kol kemerinin sırtla buluştuğu nokta", en: "Where the arm arch meets the back" },
  },
  {
    src: "/chair/details/seat.jpg",
    width: 540,
    height: 270,
    alt: { tr: "Kadife oturak ve el dikişi pervaz", en: "Velvet seat and hand-sewn welt" },
  },
  {
    src: "/chair/details/rose.jpg",
    width: 240,
    height: 190,
    alt: { tr: "Rossaria gülünün yakın çekimi", en: "Close-up of a Rossaria rose" },
  },
] as const;

/** Büyük, duyarlı kullanım için kaynak kumaş (Next/Image ile boyutlanır). */
export const fabricSrc = (id: string) => `/fabrics/${id}.jpg`;
/** Hazır küçük sürümler: optimizasyon sunucusunu yormadan doğrudan sunulur. */
export const fabricTex = (id: string) => `/fabrics/tex/${id}.webp`; // 3B doku, en uzun kenar 1024
export const fabricSwatch = (id: string) => `/fabrics/sw/${id}.webp`; // kare numune, 256
export const fabricTile = (id: string) => `/fabrics/tile/${id}.webp`; // dikey şerit karosu, 440 genişlik

/** Seçilmeden önce (üzerine gelince, dokununca) 3B dokusunu tarayıcı önbelleğine alır. */
const prefetched = new Set<string>();
export function prefetchFabric(id: string) {
  if (typeof window === "undefined" || prefetched.has(id)) return;
  prefetched.add(id);
  const img = new window.Image();
  img.decoding = "async";
  img.src = fabricTex(id);
}

/** Her desen kodunu temsil eden kumaş. */
const LEAD: Record<string, string> = { bahce: "rossaria", fauna: "mayura", susleme: "soraya", ruya: "simur" };
export const leadFabric = (codeId: string) => LEAD[codeId] ?? fabrics.find((f) => f.code === codeId)?.id ?? "rossaria";

/** 3B önizlemede oturak kadifesinin rengi: kumaşın baskın koyu tonuyla eşleşir. */
export const VELVET: Record<string, string> = {
  rossaria: "#6e1a24",
  colibri: "#1d4a3a",
  sahara: "#7a3a1c",
  ardente: "#4a2416",
  panthera: "#5e1a1f",
  mayura: "#163845",
  soraya: "#5a2318",
  mirza: "#4a2e1c",
  zafran: "#7a2e14",
  sapphire: "#142a4e",
  simur: "#1d3f33",
};

/** Konu metninden kararlı bir detay görseli seçer. */
export function detailFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return DETAILS[h % DETAILS.length];
}

export const chairAlt = (lang: Lang, fabricName?: string) =>
  lang === "tr"
    ? `Serir koltuk, Rossaria sırt ve kadife oturak${fabricName && fabricName !== "Rossaria" ? ` · arkada ${fabricName} kumaşı` : ""}`
    : `Serir armchair, Rossaria back and velvet seat${fabricName && fabricName !== "Rossaria" ? ` · ${fabricName} fabric behind` : ""}`;
