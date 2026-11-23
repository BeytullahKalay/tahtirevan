// Yereldeki panel verisini (data/tahtirevan.db, SQLite) Netlify'a aktarılmak üzere hazırlar.
//
// Kullanım (site/ klasöründe; Netlify'a giriş yapılmış olmalı: npx netlify-cli login):
//   npm run netlify:veri                  (canlı veritabanı boşsa bir sonraki derlemede aktarılır)
//   npm run netlify:veri -- --uzerine-yaz (canlıda veri varsa siler, yeniden aktarır)
//   npm run netlify:veri -- --yalnizca-dosya  (yüklemez, yalnızca backups/netlify-aktarim.json yazar; deneme için)
//
// Neden doğrudan yazmıyor: Netlify canlı veritabanına bilgisayardan yalnızca OKUMA izni veriyor.
// Yazma izni yalnızca Netlify'ın kendi derlemesinde var. Bu yüzden:
//  1. Bu betik yerel veriyi tek bir JSON dosyasına döker ve Netlify Blobs'taki gizli "aktarim" deposuna yükler.
//  2. Bir sonraki Netlify derlemesinde scripts/netlify-veri-yukle.mjs onu veritabanına yazar (aynı dosyayı bir kez).
//     Derleme dosyayı silemez (Netlify derlemelere yalnızca okuma izni veriyor); derleme bitince silmek için:
//     npx netlify-cli blobs:delete aktarim veri.json
// Dosyada kullanıcı hesapları (şifre özetleriyle) ve açılış listesi de var; depo herkese açık değildir.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

const SITE_ID = process.env.NETLIFY_SITE_ID || "03a2575d-9628-4b4a-9781-c6d021693799"; // Netlify projesi: tahtirevan
const replace = process.argv.includes("--uzerine-yaz");
const fileOnly = process.argv.includes("--yalnizca-dosya");
const root = path.resolve(import.meta.dirname, "..");
const source = process.env.KAYNAK_DB || `file:${path.join(root, "data", "tahtirevan.db").replace(/\\/g, "/")}`;
const outFile = path.join(root, "backups", "netlify-aktarim.json");

const q = (name) => `"${name.replace(/"/g, '""')}"`;
const lite = createClient({ url: source });

const SKIP = new Set(["payload_migrations"]);
const names = (await lite.execute(`select name from sqlite_master where type = 'table' and name not like 'sqlite_%' order by name`)).rows
  .map((r) => String(r.name))
  .filter((t) => !SKIP.has(t) && !t.startsWith("__"));

const tables = {};
let total = 0;
for (const t of names) {
  const columns = (await lite.execute(`pragma table_info(${q(t)})`)).rows.map((r) => String(r.name));
  const { rows } = await lite.execute(`select ${columns.map(q).join(", ")} from ${q(t)}`);
  tables[t] = {
    columns,
    rows: rows.map((row) =>
      columns.map((c) => {
        const v = row[c];
        if (typeof v === "bigint") return Number(v);
        if (v instanceof ArrayBuffer || ArrayBuffer.isView(v)) return { $b64: Buffer.from(v).toString("base64") };
        return v ?? null;
      }),
    ),
  };
  total += rows.length;
}
lite.close();

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify({ createdAt: new Date().toISOString(), replace, tables }));
const sizeMb = (fs.statSync(outFile).size / 1024 / 1024).toFixed(2);
console.log(`Yerel veri hazır: ${names.length} tablo, ${total} satır (${sizeMb} MB).`);

if (fileOnly) {
  console.log(`Yüklenmedi (--yalnizca-dosya): ${outFile}`);
  process.exit(0);
}

console.log("Netlify'a yükleniyor…");
const r = spawnSync("npx", ["-y", "netlify-cli", "blobs:set", "aktarim", "veri.json", "--input", `"${outFile}"`, "--force"], {
  shell: process.platform === "win32",
  env: { ...process.env, NETLIFY_SITE_ID: SITE_ID },
  stdio: ["ignore", "inherit", "inherit"],
});
fs.rmSync(outFile, { force: true });
if (r.status !== 0) {
  console.error("Yükleme başarısız. Netlify'a giriş yaptığınızdan emin olun (npx netlify-cli login) ve yeniden deneyin.");
  process.exit(1);
}
console.log(
  replace
    ? "Tamam. Bir sonraki Netlify derlemesinde canlıdaki veri silinip bu veri yazılacak."
    : "Tamam. Bir sonraki Netlify derlemesinde, canlı veritabanı boşsa bu veri yazılacak.",
);
console.log("Şimdi Netlify'da yeni bir derleme başlatın (Deploys → Trigger deploy → Deploy project).");
console.log("Derlemede veri yazılınca dosyayı silin: npx netlify-cli blobs:delete aktarim veri.json");
