import fs from "node:fs/promises";
import path from "node:path";
import { APIError, type CollectionConfig } from "payload";
import { ModelError, hasNamedParts, prepareChairModel } from "../chairModel";
import { L, protectDelete, revalidateAfterChange } from "../shared";

/** Yüklenen dosyalar `site/media/` altında durur (Git'e girmez; yedekleme betiği bunu da alır). */
const dir = (name: string) => path.resolve(process.cwd(), "media", name);

const altField = {
  name: "alt",
  type: "text" as const,
  localized: true,
  label: L("Alternatif metin", "Alt text"),
  admin: { description: L("Görseli göremeyenler için kısa açıklama.", "Short description for people who cannot see the image.") },
};

/**
 * Kumaş görselleri. Yüklenince üç sürüm kendiliğinden üretilir:
 * 3B doku (en uzun kenar 1024), kare numune (256) ve dikey şerit karosu (440×575).
 */
export const FabricImages: CollectionConfig = {
  slug: "fabric-images",
  labels: { singular: L("Kumaş görseli", "Fabric image"), plural: L("Kumaş görselleri", "Fabric images") },
  admin: {
    group: L("Medya", "Media"),
    description: L(
      "Kumaşın düz, yüksek çözünürlüklü görseli. Yüklediğinizde 3B doku, numune ve şerit görselleri kendiliğinden hazırlanır. Odak noktasını kumaşın en güzel yerine koyun.",
      "A flat, high-resolution image of the fabric. Texture, swatch and tile versions are generated on upload.",
    ),
    useAsTitle: "filename",
  },
  access: { read: () => true },
  upload: {
    staticDir: dir("fabrics"),
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    resizeOptions: { width: 2400, height: 2400, fit: "inside", withoutEnlargement: true },
    focalPoint: true,
    crop: true,
    adminThumbnail: "swatch",
    imageSizes: [
      {
        name: "tex",
        width: 1024,
        height: 1024,
        fit: "inside",
        withoutEnlargement: true,
        formatOptions: { format: "webp", options: { quality: 72 } },
      },
      { name: "swatch", width: 256, height: 256, fit: "cover", formatOptions: { format: "webp", options: { quality: 80 } } },
      { name: "tile", width: 440, height: 575, fit: "cover", formatOptions: { format: "webp", options: { quality: 74 } } },
    ],
  },
  fields: [altField],
};

/** Ürün ve detay fotoğrafları. Sitede boyutlandırmayı Next/Image yapar; ek sürüm üretilmez. */
export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: L("Fotoğraf", "Photo"), plural: L("Fotoğraflar", "Photos") },
  admin: {
    group: L("Medya", "Media"),
    description: L(
      "Ürün fotoğrafları. Ürün portresi için arka planı temizlenmiş (şeffaf) PNG en iyi sonucu verir.",
      "Product photos. A transparent PNG works best for product portraits.",
    ),
    useAsTitle: "filename",
  },
  access: { read: () => true },
  upload: {
    staticDir: dir("photos"),
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    resizeOptions: { width: 3000, height: 3000, fit: "inside", withoutEnlargement: true },
    focalPoint: true,
    adminThumbnail: "thumbnail",
    imageSizes: [{ name: "thumbnail", width: 320, height: 320, fit: "inside", formatOptions: { format: "webp", options: { quality: 75 } } }],
  },
  fields: [
    altField,
    {
      name: "preview",
      type: "checkbox",
      defaultValue: false,
      label: L("Tasarım önizlemesi (gerçek fotoğraf değil)", "Design preview (not a real photo)"),
      admin: {
        description: L(
          "Yapay zekâ ya da 3B ile üretilmiş görseller için işaretleyin; sitede üzerine \"Tasarım önizlemesi · Kumaş gerçek\" yazılır. Gerçek ürün fotoğrafında boş bırakın.",
          "Tick for AI or 3D generated images; the site labels them \"Design preview · Real fabric\". Leave empty for real product photos.",
        ),
      },
    },
  ],
};

/* ---------- 3B modeller ---------- */

/** Yüklenen ham modelin kopyası; ayarlar değişince model buradan yeniden hazırlanır. */
const sourcePath = (filename: string) => path.join(dir("models"), "kaynak", path.basename(filename));

const prepOptions = (data: { heightCm?: number | null; backStart?: number | null } | undefined) => ({
  height: (data?.heightCm || 81) / 100,
  cut: (data?.backStart || 67) / 100,
});

/** Hazırlama hatasını panelde okunur bir mesaja çevirir. */
async function prepare(buf: Buffer, data: Parameters<typeof prepOptions>[0]) {
  try {
    return await prepareChairModel(buf, prepOptions(data));
  } catch (e) {
    if (e instanceof ModelError) throw new APIError(e.message, 400, null, true);
    throw new APIError("Model okunamadı. Dosyanın bozuk olmadığından ve .glb olduğundan emin olun.", 400, null, true);
  }
}

type ModelCtx = { modelSource?: Buffer };

/** Parçaya özel 3B modeller (GLB). */
export const Models: CollectionConfig = {
  slug: "models",
  labels: { singular: L("3B model", "3D model"), plural: L("3B modeller", "3D models") },
  admin: {
    group: L("Medya", "Media"),
    description: L(
      "Fotoğraftan yapay zekâ ile üretilmiş .glb dosyasını olduğu gibi yükleyin: sırt kumaşı, oturak kadifesi ve metal gövde kendiliğinden ayrılır, sitede kumaş değiştirilebilir. Sonra modeli Parçalar › Görsel ve 3B'den bir ürüne bağlayın.",
      "Upload the AI-generated .glb as is: the back fabric, seat velvet and metal frame are separated automatically. Then link it to a piece.",
    ),
    useAsTitle: "filename",
    defaultColumns: ["filename", "heightCm", "updatedAt"],
  },
  access: { read: () => true },
  upload: {
    staticDir: dir("models"),
    mimeTypes: ["model/gltf-binary", "application/octet-stream"],
  },
  hooks: {
    beforeValidate: [
      ({ req }) => {
        const name = req.file?.name;
        if (name && !name.toLowerCase().endsWith(".glb")) throw new APIError("Yalnızca .glb dosyası yüklenebilir.", 400, null, true);
      },
    ],
    // Yeni dosya geldiğinde: kaydedilmeden önce parçalara ayır
    beforeOperation: [
      async ({ args, operation, req }) => {
        const file = req.file;
        if ((operation !== "create" && operation !== "update") || !file) return args;
        if (!file.name.toLowerCase().endsWith(".glb")) return args;
        const buf = file.tempFilePath ? await fs.readFile(file.tempFilePath) : file.data;
        const data = (args.data ?? {}) as Record<string, unknown>;
        if (hasNamedParts(buf)) {
          data.prepared = false;
          data.report = "Hazır model: \"Kumas\" malzemesi bulundu, model olduğu gibi kullanılıyor.";
        } else {
          const r = await prepare(buf, data);
          (req.context as ModelCtx).modelSource = buf;
          file.data = r.glb;
          file.size = r.glb.length;
          if (file.tempFilePath) await fs.writeFile(file.tempFilePath, r.glb);
          data.prepared = true;
          data.report = r.report;
        }
        args.data = data;
        return args;
      },
    ],
    // Dosya değişmeden yalnızca ayar değiştiyse: kaynaktan yeniden hazırla
    beforeChange: [
      async ({ data, originalDoc, operation, req }) => {
        if (operation !== "update" || req.file || !originalDoc?.prepared || !originalDoc.filename) return data;
        const before = prepOptions(originalDoc);
        const after = prepOptions({ heightCm: data.heightCm ?? originalDoc.heightCm, backStart: data.backStart ?? originalDoc.backStart });
        if (before.height === after.height && before.cut === after.cut) return data;
        let src: Buffer;
        try {
          src = await fs.readFile(sourcePath(originalDoc.filename));
        } catch {
          throw new APIError("Modelin ilk hâli bulunamadı; ayarı değiştirmek için .glb dosyasını yeniden yükleyin.", 400, null, true);
        }
        const r = await prepare(src, { heightCm: after.height * 100, backStart: after.cut * 100 });
        await fs.writeFile(path.join(dir("models"), path.basename(originalDoc.filename)), r.glb);
        return { ...data, report: r.report, filesize: r.glb.length };
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        const src = (req.context as ModelCtx).modelSource;
        if (!src || !doc.filename) return doc;
        await fs.mkdir(path.dirname(sourcePath(doc.filename)), { recursive: true });
        await fs.writeFile(sourcePath(doc.filename), src);
        if (previousDoc?.filename && previousDoc.filename !== doc.filename) await fs.rm(sourcePath(previousDoc.filename), { force: true });
        return doc;
      },
      // Model ayarı değişince sitedeki önbellek yenilensin (adres ?v= ile değişir)
      revalidateAfterChange,
    ],
    beforeDelete: [
      protectDelete("3B model", [{ collection: "pieces", field: "model", label: "Parçalar" }]),
      async ({ req, id }) => {
        const s = (await req.payload.findGlobal({ slug: "site-settings", depth: 0, req })) as { studio?: { model?: number | string | null } };
        if (s?.studio?.model == id) throw new APIError("Bu model Site ayarları › Kumaş stüdyosu'nda seçili; önce oradan değiştirin.", 400, null, true);
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        if (doc?.filename) await fs.rm(sourcePath(doc.filename), { force: true });
      },
    ],
  },
  fields: [
    {
      name: "preview",
      type: "ui",
      admin: { components: { Field: "/payload/components/ModelPreview#ModelPreview" } },
    },
    {
      name: "report",
      type: "textarea",
      label: L("Hazırlama sonucu", "Preparation result"),
      admin: { readOnly: true, rows: 3, description: L("Kaydettiğinizde kendiliğinden yazılır.", "Filled in automatically on save.") },
    },
    {
      type: "row",
      fields: [
        {
          name: "heightCm",
          type: "number",
          defaultValue: 81,
          min: 20,
          max: 300,
          label: L("Gerçek yükseklik (cm)", "Real height (cm)"),
          admin: {
            width: "50%",
            description: L("Ürünün yerden en üst noktasına yüksekliği. Kumaş deseni buna göre gerçek boyunda görünür.", "Floor to top. Sets the real size of the fabric pattern."),
          },
        },
        {
          name: "backStart",
          type: "number",
          defaultValue: 67,
          min: 30,
          max: 90,
          label: L("Sırtın başladığı yükseklik (%)", "Where the back starts (%)"),
          admin: {
            width: "50%",
            description: L(
              "Oturak ile sırtı ayıran çizgi, yüksekliğin yüzdesi. Önizlemede sırtın altı kadife görünüyorsa küçültün, oturak kumaşla kaplıysa büyütün; sonra Kaydet.",
              "The line between seat and back. Lower it if the bottom of the back looks like velvet; raise it if the seat shows fabric.",
            ),
          },
        },
      ],
    },
    { name: "prepared", type: "checkbox", admin: { hidden: true } },
  ],
};
