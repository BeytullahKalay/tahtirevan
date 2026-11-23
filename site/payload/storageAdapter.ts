/**
 * Payload yükleme koleksiyonları için depolama bağlantısı. Dosyaları `fileStore` üzerinden
 * yazar/okur/siler: yerelde `media/`, Netlify'da Netlify Blobs. Adresler değişmez:
 * `/api/<koleksiyon>/file/<dosya>` (Payload'ın kendi adresi, erişim denetimiyle).
 */
import fs from "node:fs/promises";
import path from "node:path";
import type { Adapter } from "@payloadcms/plugin-cloud-storage/types";
import { deleteFile, readFile, writeFile } from "./fileStore";

/** Koleksiyon → `media/` altındaki klasör (eski düzenle aynı). */
export const MEDIA_DIRS: Record<string, string> = {
  "fabric-images": "fabrics",
  media: "photos",
  videos: "videos",
  models: "models",
};

export const mediaKey = (collection: string, filename: string) => `${MEDIA_DIRS[collection] ?? collection}/${path.basename(filename)}`;

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".glb": "model/gltf-binary",
};

/** "bytes=0-1023" → [başlangıç, bitiş]; geçersizse null. */
function parseRange(header: string | null, size: number): [number, number] | null {
  const m = header && /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m || (!m[1] && !m[2])) return null;
  let start = m[1] ? Number(m[1]) : size - Number(m[2]);
  let end = m[1] && m[2] ? Number(m[2]) : size - 1;
  start = Math.max(0, start);
  end = Math.min(size - 1, end);
  return start <= end ? [start, end] : null;
}

export const fileStoreAdapter: Adapter = ({ collection }) => ({
  name: "tahtirevan-file-store",

  async handleUpload({ file }) {
    // Büyük yüklemeler geçici dosyaya yazılmış olabilir
    const data = file.buffer?.length ? file.buffer : file.tempFilePath ? await fs.readFile(file.tempFilePath) : file.buffer;
    await writeFile(mediaKey(collection.slug, file.filename), data, file.mimeType);
  },

  async handleDelete({ filename }) {
    await deleteFile(mediaKey(collection.slug, filename));
  },

  async staticHandler(req, { params }) {
    const data = await readFile(mediaKey(collection.slug, params.filename));
    if (!data) return new Response("Not found", { status: 404 });
    const headers = new Headers({
      "Content-Type": TYPES[path.extname(params.filename).toLowerCase()] ?? "application/octet-stream",
      "Accept-Ranges": "bytes",
      // Adresler ?v=<güncelleme zamanı> taşıdığı için uzun önbellek güvenli
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    });
    // Safari videoyu parça parça ister (Range); desteklenmezse oynatmaz
    const range = parseRange(req.headers.get("range"), data.length);
    if (range) {
      const [start, end] = range;
      headers.set("Content-Range", `bytes ${start}-${end}/${data.length}`);
      headers.set("Content-Length", String(end - start + 1));
      return new Response(new Uint8Array(data.subarray(start, end + 1)), { status: 206, headers });
    }
    headers.set("Content-Length", String(data.length));
    return new Response(new Uint8Array(data), { status: 200, headers });
  },
});
