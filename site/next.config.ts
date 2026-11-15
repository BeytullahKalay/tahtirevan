import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Yalnızca WebP: AVIF kodlaması çok yavaş; ilk istekte görsel kuyruğu birikip sayfa "yüklenmiyor" görünüyordu.
    formats: ["image/webp"],
    // Kaynak görseller en fazla ~1250 px; daha büyük boyutlar aynı dosyayı yeniden üretmekten öteye gitmez.
    // Daha az boyut = daha az ilk istek dönüştürmesi ve daha iyi önbellek isabeti.
    deviceSizes: [640, 828, 1080, 1280, 1920],
    imageSizes: [96, 160, 256, 384],
  },
  async redirects() {
    return [];
  },
};

export default nextConfig;
