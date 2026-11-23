/**
 * Tahtırevan admin paneli (Payload CMS). Panel: /admin
 * Veri: data/tahtirevan.db (SQLite) · Yüklenen dosyalar: media/  — ikisi de Git'e girmez; `npm run backup` ile yedekleyin.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { en } from "@payloadcms/translations/languages/en";
import { tr } from "@payloadcms/translations/languages/tr";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Fabrics, PatternCodes, PieceCollections, Pieces, Studies } from "./payload/collections/catalog";
import { Finishes, PieceTypes, Sizes, Woods } from "./payload/collections/options";
import { FabricImages, Media, Models, Videos } from "./payload/collections/uploads";
import { Signups } from "./payload/collections/signups";
import { Users } from "./payload/collections/users";
import { SiteSettings } from "./payload/globals/siteSettings";
import { SiteStatus } from "./payload/globals/siteStatus";

const dirname = path.dirname(fileURLToPath(import.meta.url));
fs.mkdirSync(path.resolve(dirname, "data"), { recursive: true });

if (!process.env.PAYLOAD_SECRET) throw new Error("PAYLOAD_SECRET tanımlı değil (site/.env).");

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: " · Tahtırevan Panel" },
    dateFormat: "d MMMM yyyy HH:mm",
  },
  collections: [
    Pieces,
    Studies,
    Fabrics,
    PieceCollections,
    PatternCodes,
    PieceTypes,
    Woods,
    Finishes,
    Sizes,
    FabricImages,
    Media,
    Videos,
    Models,
    Signups,
    Users,
  ],
  globals: [SiteStatus, SiteSettings],
  localization: {
    locales: [
      { code: "tr", label: "Türkçe" },
      { code: "en", label: "English" },
    ],
    defaultLocale: "tr",
    fallback: true,
  },
  i18n: { supportedLanguages: { tr, en }, fallbackLanguage: "tr" },
  secret: process.env.PAYLOAD_SECRET,
  db: sqliteAdapter({ client: { url: process.env.DATABASE_URI || "file:./data/tahtirevan.db" } }),
  sharp,
  upload: { limits: { fileSize: 60 * 1024 * 1024 } },
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
});
