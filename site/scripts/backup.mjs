// Admin paneli verisini yedekler: data/ (veritabanı) ve media/ (yüklenen dosyalar)
// backups/<tarih-saat>/ altına kopyalanır.  Kullanım: npm run backup
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
const dest = path.join(root, "backups", stamp);

for (const dir of ["data", "media"]) {
  const src = path.join(root, dir);
  if (!fs.existsSync(src)) {
    console.log(`- ${dir}/ yok, atlandı`);
    continue;
  }
  fs.cpSync(src, path.join(dest, dir), { recursive: true });
  console.log(`✓ ${dir}/ → backups/${stamp}/${dir}/`);
}
console.log("Yedek tamam. Bu klasörü bilgisayar dışında (bulut/harici disk) da saklayın.");
