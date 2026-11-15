import path from "node:path";
import type { CollectionConfig } from "payload";
import { L } from "../shared";

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
  fields: [altField],
};

/** Parçaya özel 3B modeller (GLB). */
export const Models: CollectionConfig = {
  slug: "models",
  labels: { singular: L("3B model", "3D model"), plural: L("3B modeller", "3D models") },
  admin: {
    group: L("Medya", "Media"),
    description: L(
      "Parçanın kendi 3B modeli (.glb). Kumaşın giydirileceği malzemenin adı \"Kumas\", oturak kadifesininki \"Kadife\" olmalı. Model yoksa sitede kodla çizilen koltuk kullanılır.",
      "The piece's own 3D model (.glb). Name the fabric material \"Kumas\" and the seat velvet \"Kadife\".",
    ),
    useAsTitle: "filename",
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
        if (name && !name.toLowerCase().endsWith(".glb")) throw new Error("Yalnızca .glb dosyası yüklenebilir.");
      },
    ],
  },
  fields: [],
};
