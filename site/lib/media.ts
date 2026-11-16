import type { Lang } from "./i18n";

/**
 * Geçici ürün görselleri: tek bir ürün fotoğrafı (Serir, Rossaria sırtlı) ve ondan alınan
 * yakın kırpımlar. Bir parçanın kendi fotoğrafı yoksa bunlar kullanılır.
 * Kumaş görselleri ve adresleri katalogdan gelir (Fabric.image / tex / swatch / tile).
 */

/**
 * Geçici koltuk görseli ve 3B koltuk yapay zekâyla üretildi; üzerindeki kumaş gerçek.
 * Bu görsellerin göründüğü her yerde bu not yazılır (yanıltıcı reklam sayılmasın diye).
 */
export const PREVIEW_NOTE = {
  tr: "Tasarım önizlemesi · Kumaş gerçek",
  en: "Design preview · Real fabric",
} as const;

/** Arka planı temizlenmiş ürün fotoğrafı (şeffaf PNG). */
export const CHAIR = { src: "/chair/serir-hd.png", width: 2018, height: 2256 };

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

type Detail = { src: string; width: number; height: number; alt: { tr: string; en: string } };

/**
 * Sırtı başka kumaşla giydirilmiş koltuğun yakın çekimleri (3B koltuktan alındı). Sıra DETAILS ile aynı:
 * sırt, kol kemeri, oturak, yakın motif. Burada olmayan kumaşlarda Rossaria kırpımları kullanılır.
 */
const FABRIC_DETAILS: Record<string, readonly Detail[]> = {
  panthera: [
    {
      src: "/chair/details/panthera-back-2.jpg",
      width: 640,
      height: 800,
      alt: { tr: "Sırtın ortasına yerleştirilmiş Panthera parsı", en: "The Panthera leopard centred on the back" },
    },
    {
      src: "/chair/details/panthera-arch-2.jpg",
      width: 640,
      height: 800,
      alt: { tr: "Kol kemerinin Panthera sırtla buluştuğu nokta", en: "Where the arm arch meets the Panthera back" },
    },
    DETAILS[2],
    {
      src: "/chair/details/panthera-head-2.jpg",
      width: 800,
      height: 550,
      alt: { tr: "Panthera parsının yakın çekimi", en: "Close-up of the Panthera leopard" },
    },
  ],
};

/** Kumaşa göre yakın çekim seti; o kumaş için çekim yoksa geçici (Rossaria) kırpımlar. */
export const detailsFor = (fabric?: string): readonly Detail[] => (fabric && FABRIC_DETAILS[fabric]) || DETAILS;

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
export function detailFor(seed: string, set: readonly Detail[] = DETAILS) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return set[h % set.length];
}

export const chairAlt = (lang: Lang, fabricName?: string) =>
  lang === "tr"
    ? `Serir koltuk, Rossaria sırt ve kadife oturak${fabricName && fabricName !== "Rossaria" ? ` · arkada ${fabricName} kumaşı` : ""}`
    : `Serir armchair, Rossaria back and velvet seat${fabricName && fabricName !== "Rossaria" ? ` · ${fabricName} fabric behind` : ""}`;
