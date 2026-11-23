import path from "node:path";
import { fileURLToPath } from "node:url";
import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Netlify'da formlar Netlify Forms'a gider (lib/forms.ts); Netlify derlemede NETLIFY=true verir
  env: { NEXT_PUBLIC_FORMS: process.env.NETLIFY === "true" ? "netlify" : "api" },
  images: {
    // Yalnızca WebP: AVIF kodlaması çok yavaş; ilk istekte görsel kuyruğu birikip sayfa "yüklenmiyor" görünüyordu.
    formats: ["image/webp"],
    // Kaynak görseller en fazla ~2400 px; daha az boyut = daha az ilk istek dönüştürmesi ve daha iyi önbellek isabeti.
    deviceSizes: [640, 828, 1080, 1280, 1920],
    imageSizes: [96, 160, 256, 384],
  },
  // Payload şablonundan: .js uzantılı içe aktarmaları TypeScript dosyalarına çözer
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
  turbopack: { root: path.resolve(dirname) },
  async redirects() {
    return [];
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
