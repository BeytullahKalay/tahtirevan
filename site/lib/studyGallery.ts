import type { Img } from "./catalog";

/**
 * Etüt kartlarında ana görselden (panel › Etütler › Görsel) sonra sırayla gösterilen ek kareler.
 * Anahtar: etüdün paneldeki "key" alanı. Dosyalar public/etutler/ altında, 900×1200 WebP (3:4).
 * Kaynak: D:\tahtirevan\pazarlama-video\reels-N kareleri (Yelpaze: reels-3/blue-chair-reels.mp4 karelerinden).
 * Yeni kare eklerken yeni bir dosya adı ver (aynı adla değiştirme: görsel önbelleği eskisini gösterir).
 */
export const STUDY_GALLERY: Record<string, Img[]> = {
  kavis: [
    { src: "/etutler/kavis-2.webp", width: 900, height: 1200, alt: { tr: "Kol ve oturak, yandan", en: "Arm and seat, from the side" } },
    { src: "/etutler/kavis-3.webp", width: 900, height: 1200, alt: { tr: "Üstten, sırtın kavisi", en: "From above, the curve of the back" } },
    { src: "/etutler/kavis-4.webp", width: 900, height: 1200, alt: { tr: "Kumaşın yakın çekimi", en: "The fabric up close" } },
  ],
  pusu: [
    { src: "/etutler/pusu-2.webp", width: 900, height: 1200, alt: { tr: "Kol ve ceviz ayak, yakından", en: "Arm and walnut leg, up close" } },
    { src: "/etutler/pusu-3.webp", width: 900, height: 1200, alt: { tr: "Arkadan, yuvarlak sırt", en: "From behind, the rounded back" } },
  ],
  tablo: [
    { src: "/etutler/tablo-2.webp", width: 900, height: 1200, alt: { tr: "Yandan, ince metal gövde", en: "From the side, slim metal frame" } },
    { src: "/etutler/tablo-3.webp", width: 900, height: 1200, alt: { tr: "Önden, sırt bir tablo gibi", en: "From the front, the back as a painting" } },
    { src: "/etutler/tablo-4.webp", width: 900, height: 1200, alt: { tr: "Kumaşın yakın çekimi", en: "The fabric up close" } },
  ],
  yelpaze: [
    { src: "/etutler/yelpaze-r3-2.webp", width: 900, height: 1200, alt: { tr: "Kolun ve kumaşın yakın çekimi", en: "The arm and the fabric up close" } },
    { src: "/etutler/yelpaze-r3-3.webp", width: 900, height: 1200, alt: { tr: "Yandan, akşam ışığında", en: "From the side, in the evening light" } },
    { src: "/etutler/yelpaze-r3-4.webp", width: 900, height: 1200, alt: { tr: "Çayırda, uzaktan", en: "In the meadow, from afar" } },
  ],
  cardak: [
    { src: "/etutler/cardak-2.webp", width: 900, height: 1200, alt: { tr: "Yandan, kubbe sırt", en: "From the side, the domed back" } },
    { src: "/etutler/cardak-3.webp", width: 900, height: 1200, alt: { tr: "Önden, kubbenin içi", en: "From the front, inside the dome" } },
    { src: "/etutler/cardak-4.webp", width: 900, height: 1200, alt: { tr: "Kumaşın yakın çekimi", en: "The fabric up close" } },
  ],
  gondol: [
    { src: "/etutler/gondol-2.webp", width: 900, height: 1200, alt: { tr: "Kol ve oyma ayak", en: "Arm and carved leg" } },
    { src: "/etutler/gondol-3.webp", width: 900, height: 1200, alt: { tr: "Mermer ocağında, uzaktan", en: "In the marble quarry, from afar" } },
    { src: "/etutler/gondol-4.webp", width: 900, height: 1200, alt: { tr: "Kumaşın yakın çekimi", en: "The fabric up close" } },
  ],
};
