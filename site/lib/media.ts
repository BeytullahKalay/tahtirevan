import type { Lang } from "./i18n";

/**
 * Geçici ürün görselleri: tek bir ürün fotoğrafı (Serir, Rossaria sırtlı) ve ondan alınan
 * yakın kırpımlar. Bir parçanın kendi fotoğrafı yoksa bunlar kullanılır.
 * Kumaş görselleri ve adresleri katalogdan gelir (Fabric.image / tex / swatch / tile).
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

/** Seçilmeden önce (üzerine gelince, dokununca) 3B dokusunu tarayıcı önbelleğine alır. */
const prefetched = new Set<string>();
export function prefetchTexture(url: string) {
  if (typeof window === "undefined" || prefetched.has(url)) return;
  prefetched.add(url);
  const img = new window.Image();
  img.decoding = "async";
  img.src = url;
}

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
