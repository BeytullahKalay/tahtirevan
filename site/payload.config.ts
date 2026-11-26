/**
 * Tahtırevan admin paneli (Payload CMS). Panel: /admin
 * Yerelde: veri data/tahtirevan.db (SQLite), yüklenen dosyalar media/ — ikisi de Git'e girmez; `npm run backup` ile yedekleyin.
 * Netlify'da: veri Netlify Database (Postgres, NETLIFY_DB_URL), dosyalar Netlify Blobs (payload/fileStore.ts).
 * Postgres şeması `migrations/` klasöründeki göçlerle kurulur (Netlify derlemesinde `payload migrate`).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { cloudStoragePlugin } from "@payloadcms/plugin-cloud-storage";
import { MEDIA_DIRS, fileStoreAdapter } from "./payload/storageAdapter";
import { en } from "@payloadcms/translations/languages/en";
import { tr } from "@payloadcms/translations/languages/tr";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Fabrics, PatternCodes, PieceCollections, Pieces, Studies } from "./payload/collections/catalog";
import { Finishes, PieceTypes, Sizes, Woods } from "./payload/collections/options";
import { FabricImages, Media, Models, Videos } from "./payload/collections/uploads";
import { Signups } from "./payload/collections/signups";
import { PreorderEvents, Preorders } from "./payload/collections/preorders";
import { PreorderPage } from "./payload/globals/preorderPage";
import { Users } from "./payload/collections/users";
import { SiteSettings } from "./payload/globals/siteSettings";
import { SiteStatus } from "./payload/globals/siteStatus";

const dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.PAYLOAD_SECRET) throw new Error("PAYLOAD_SECRET tanımlı değil (site/.env).");

/** Postgres adresi: Netlify'da NETLIFY_DB_URL; elle denemek için DATABASE_URI=postgres://… da olur. */
const postgresUrl =
  process.env.NETLIFY_DB_URL || (process.env.DATABASE_URI?.startsWith("postgres") ? process.env.DATABASE_URI : undefined);

// Netlify'da SQLite'a düşmek veri kaybı demek (disk kalıcı değil): adres yoksa açıkça dur.
// NETLIFY_DB_URL'yi Netlify, package.json'da @netlify/database paketi varsa verir.
const onNetlifyPlatform = process.env.NETLIFY === "true" || Boolean(process.env.NETLIFY_BLOBS_CONTEXT);
if (onNetlifyPlatform && !postgresUrl) {
  throw new Error(
    "Netlify'da veritabanı adresi (NETLIFY_DB_URL) yok. Projede Netlify Database açık mı, package.json'da @netlify/database var mı?",
  );
}

const db = postgresUrl
  ? postgresAdapter({
      pool: { connectionString: postgresUrl },
      migrationDir: path.resolve(dirname, "migrations"),
      // Şema yalnızca göçlerle değişir; canlı veritabanına kendiliğinden dokunulmaz
      push: false,
    })
  : (fs.mkdirSync(path.resolve(dirname, "data"), { recursive: true }),
    sqliteAdapter({ client: { url: process.env.DATABASE_URI || "file:./data/tahtirevan.db" } }));

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
    Preorders,
    PreorderEvents,
    Users,
  ],
  globals: [SiteStatus, SiteSettings, PreorderPage],
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
  db,
  sharp,
  plugins: [
    cloudStoragePlugin({
      collections: Object.fromEntries(Object.keys(MEDIA_DIRS).map((slug) => [slug, { adapter: fileStoreAdapter }])),
    }),
  ],
  upload: { limits: { fileSize: 60 * 1024 * 1024 } },
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
});
