// Yereldeki yüklenmiş dosyaları (site/media/) Netlify Blobs'taki "media" deposuna yükler.
// Anahtarlar sitedekiyle aynıdır: fabrics/…, photos/…, videos/…, models/… ve models/kaynak/…
//
// Kullanım (site/ klasöründe; Netlify'a giriş yapılmış olmalı: npx netlify-cli login):
//   node scripts/netlify-dosya-aktar.mjs
// Netlify komut aracını kullanır; şifre ya da anahtar istemez, sizin girişinizle çalışır.
// Aynı dosyayı yeniden yüklemek zararsızdır (üzerine yazılır).
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const SITE_ID = process.env.NETLIFY_SITE_ID || "03a2575d-9628-4b4a-9781-c6d021693799"; // Netlify projesi: tahtirevan
const root = path.resolve(import.meta.dirname, "..", "media");
const DIRS = ["fabrics", "photos", "videos", "models"];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

const files = DIRS.filter((d) => fs.existsSync(path.join(root, d))).flatMap((d) => walk(path.join(root, d)));
const big = files.filter((f) => fs.statSync(f).size > 4.5 * 1024 * 1024);
if (big.length) console.log(`Not: ${big.length} dosya 4,5 MB'tan büyük; sitede okunur ama panelden yeniden yüklenemez:\n  ${big.map((f) => path.relative(root, f)).join("\n  ")}`);

const run = (key, file) =>
  new Promise((resolve) => {
    const p = spawn("npx", ["-y", "netlify-cli", "blobs:set", "media", key, "--input", file, "--force"], {
      shell: process.platform === "win32",
      env: { ...process.env, NETLIFY_SITE_ID: SITE_ID },
      stdio: ["ignore", "ignore", "pipe"],
    });
    let err = "";
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code) => resolve(code === 0 ? null : err.trim() || `çıkış kodu ${code}`));
  });

console.log(`${files.length} dosya yükleniyor (birkaç dakika sürebilir)…`);
let done = 0;
const failed = [];
const queue = [...files];
await Promise.all(
  Array.from({ length: 4 }, async () => {
    for (let file = queue.shift(); file; file = queue.shift()) {
      const key = path.relative(root, file).split(path.sep).join("/");
      // Windows'ta komut kabuktan geçer; boşluklu yollar tırnak ister
      const qq = (s) => (process.platform === "win32" ? `"${s}"` : s);
      const err = await run(qq(key), qq(file));
      done++;
      if (err) failed.push(`${key}: ${err.split("\n").pop()}`);
      process.stdout.write(`\r  ${done}/${files.length}`);
    }
  }),
);
console.log();
if (failed.length) {
  console.error(`${failed.length} dosya yüklenemedi:\n  ${failed.join("\n  ")}\nBetiği yeniden çalıştırabilirsiniz.`);
  process.exitCode = 1;
} else {
  console.log("Tamam: bütün dosyalar Netlify Blobs'ta.");
}
