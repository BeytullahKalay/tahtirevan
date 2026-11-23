/**
 * Yüklenen dosyaların deposu.
 * - Yerelde: `site/media/<klasör>/<dosya>` (eskisi gibi; yedekleme betiği burayı alır).
 * - Netlify'da: Netlify Blobs, "media" deposu, anahtar `<klasör>/<dosya>`.
 *   Netlify'da sunucunun diski kalıcı değil; dosyaya yazılan her şey kaybolur.
 *
 * Netlify'da mıyız? Netlify veritabanı adresi (NETLIFY_DB_URL) ya da Blobs bağlamı varsa evet.
 * İkisi de hem derlemede hem sunucu fonksiyonlarında tanımlıdır.
 */
import fs from "node:fs/promises";
import path from "node:path";

export const onNetlify = Boolean(process.env.NETLIFY_DB_URL || process.env.NETLIFY_BLOBS_CONTEXT);

const localPath = (key: string) => path.resolve(process.cwd(), "media", ...key.split("/").map((p) => path.basename(p)));

type Store = {
  get(key: string, opts: { type: "arrayBuffer" }): Promise<ArrayBuffer | null>;
  set(key: string, data: ArrayBuffer | Blob, opts?: { metadata?: Record<string, unknown> }): Promise<unknown>;
  delete(key: string): Promise<void>;
};

let store: Promise<Store> | undefined;
const blobs = () =>
  (store ??= import("@netlify/blobs").then(({ getStore }) => getStore({ name: "media", consistency: "strong" }) as unknown as Store));

/** Dosyayı okur; yoksa null. */
export async function readFile(key: string): Promise<Buffer | null> {
  if (onNetlify) {
    const ab = await (await blobs()).get(key, { type: "arrayBuffer" });
    return ab ? Buffer.from(ab) : null;
  }
  try {
    return await fs.readFile(localPath(key));
  } catch {
    return null;
  }
}

export async function writeFile(key: string, data: Buffer, contentType?: string): Promise<void> {
  if (onNetlify) {
    const ab = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
    await (await blobs()).set(key, ab, contentType ? { metadata: { contentType } } : undefined);
    return;
  }
  const file = localPath(key);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, data);
}

export async function deleteFile(key: string): Promise<void> {
  if (onNetlify) return (await blobs()).delete(key);
  await fs.rm(localPath(key), { force: true });
}
