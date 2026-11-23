import type { CollectionBeforeChangeHook } from "payload";
import sharp from "sharp";
import { readFile } from "./fileStore";
import { mediaKey } from "./storageAdapter";

type RGB = [number, number, number];

const hex = ([r, g, b]: RGB) => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

function hsl([r, g, b]: RGB) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const s = max === min ? 0 : l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
  return { s, l };
}

/** Görseli küçültüp basit k-ortalamayla baskın renkleri bulur. */
export async function dominantColors(file: string | Buffer, k = 6): Promise<{ rgb: RGB; weight: number }[]> {
  const { data } = await sharp(file).resize(48, 48, { fit: "cover" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px: RGB[] = [];
  for (let i = 0; i < data.length; i += 3) px.push([data[i], data[i + 1], data[i + 2]]);
  let centers: RGB[] = Array.from({ length: k }, (_, i) => px[Math.floor(((i + 0.5) / k) * px.length)]);
  let assign = new Array(px.length).fill(0);
  for (let iter = 0; iter < 10; iter++) {
    assign = px.map((p) => {
      let best = 0;
      let bd = Infinity;
      centers.forEach((c, j) => {
        const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2;
        if (d < bd) {
          bd = d;
          best = j;
        }
      });
      return best;
    });
    centers = centers.map((c, j) => {
      const m = px.filter((_, i) => assign[i] === j);
      if (!m.length) return c;
      return [0, 1, 2].map((ch) => m.reduce((s, p) => s + p[ch], 0) / m.length) as RGB;
    });
  }
  return centers
    .map((rgb, j) => ({ rgb, weight: assign.filter((a) => a === j).length / px.length }))
    .sort((a, b) => b.weight - a.weight);
}

/** Renkli ve bol olan üç ton + oturak kadifesi için koyu, doygun bir ton önerir. */
export function suggest(clusters: { rgb: RGB; weight: number }[]) {
  const scored = clusters
    .map((c) => {
      const { s, l } = hsl(c.rgb);
      return { ...c, s, l, score: c.weight * (0.35 + s) * (l > 0.08 && l < 0.92 ? 1 : 0.3) };
    })
    .sort((a, b) => b.score - a.score);
  const colors = scored.slice(0, 3).map((c) => hex(c.rgb));
  const base = [...scored].sort((a, b) => b.s * (1 - Math.abs(a.l - 0.35)) - a.s * (1 - Math.abs(b.l - 0.35)))[0] ?? scored[0];
  // Kadife: aynı ton, karanlıkta (l≈0.2) — kumaşla eşleşen sakin bir oturak rengi
  const { l } = hsl(base.rgb);
  const f = l > 0 ? Math.min(1, 0.22 / l) : 1;
  const velvet = hex(base.rgb.map((v) => v * f) as RGB);
  return { colors, velvet };
}

/** Kumaş kaydedilirken renkler veya kadife rengi boşsa görselden doldurur. */
export const suggestFabricColors: CollectionBeforeChangeHook = async ({ data, req }) => {
  const needColors = !Array.isArray(data.colors) || data.colors.length === 0;
  const needVelvet = !data.velvet;
  if (!data.image || (!needColors && !needVelvet)) return data;
  try {
    const imageId = typeof data.image === "object" ? data.image.id : data.image;
    const img = await req.payload.findByID({ collection: "fabric-images", id: imageId, depth: 0, req });
    if (!img?.filename) return data;
    const file = await readFile(mediaKey("fabric-images", img.filename));
    if (!file) return data;
    const { colors, velvet } = suggest(await dominantColors(file));
    if (needColors) data.colors = colors.map((color) => ({ color }));
    if (needVelvet) data.velvet = velvet;
  } catch (e) {
    req.payload.logger.warn({ err: e }, "Kumaş renkleri önerilemedi");
  }
  return data;
};
