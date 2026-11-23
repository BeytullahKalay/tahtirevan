// Coming-soon görsellerini üretir: kumaş numuneleri, OG (paylaşım) görseli, favicon PNG.
// Koltuk görseli 23 Kasım 2026'da kullanıcı isteğiyle sayfadan ve paylaşım görselinden kaldırıldı.
const path = require("path");
const fs = require("fs");
const root = process.argv[2]; // proje kökü
const sharp = require(path.join(root, "site/node_modules/sharp"));
const pub = path.join(root, "site/public");
const out = path.join(root, "coming-soon/assets");
fs.mkdirSync(path.join(out, "fabrics"), { recursive: true });

// Netlify /assets/* dosyalarını 7 gün önbellekte tutar: paylaşım görseli değişince adı da değişir
// (index.html'deki og:image yolu da güncellenir).
const OG_NAME = "og-2.jpg";

(async () => {
  const ids = ["rossaria", "colibri", "sahara", "ardente", "panthera", "mayura", "soraya", "mirza", "zafran", "sapphire", "simur"];
  for (const id of ids) {
    await sharp(path.join(pub, "fabrics", id + ".jpg"))
      .resize({ width: 360, height: 360, fit: "cover" })
      .webp({ quality: 74 })
      .toFile(path.join(out, "fabrics", id + ".webp"));
  }

  // OG 1200x630: koyu zemin, ortada iki dilli başlık, altında bir sıra kumaş dairesi (renk yalnızca kumaştan)
  const W = 1200, H = 630, D = 84, GAP = 22;
  const row = ["mayura", "soraya", "ardente", "rossaria", "panthera", "sapphire", "colibri"];
  const rowW = row.length * D + (row.length - 1) * GAP;
  const x0 = Math.round((W - rowW) / 2), y0 = 412;
  const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${D}" height="${D}"><circle cx="${D / 2}" cy="${D / 2}" r="${D / 2}" fill="#fff"/></svg>`);
  const circles = [];
  for (const [i, id] of row.entries()) {
    const img = await sharp(path.join(pub, "fabrics", id + ".jpg"))
      .resize({ width: D, height: D, fit: "cover" })
      .composite([{ input: mask, blend: "dest-in" }])
      .png()
      .toBuffer();
    circles.push({ input: img, left: x0 + i * (D + GAP), top: y0 });
  }
  const rings = row
    .map((_, i) => `<circle cx="${x0 + i * (D + GAP) + D / 2}" cy="${y0 + D / 2}" r="${D / 2 + 5}" fill="none" stroke="#B08D57" stroke-opacity="0.35" stroke-width="1"/>`)
    .join("");
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><radialGradient id="g" cx="0.5" cy="0.42" r="0.55"><stop offset="0" stop-color="#3a1a1c" stop-opacity="0.95"/><stop offset="1" stop-color="#14110F" stop-opacity="0"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="#14110F"/><rect width="${W}" height="${H}" fill="url(#g)"/>
    <text x="600" y="118" text-anchor="middle" fill="#E9E1D3" font-family="Helvetica, Arial, sans-serif" font-size="20" letter-spacing="10">TAHTIREVAN</text>
    <text x="600" y="228" text-anchor="middle" fill="#E9E1D3" font-family="Georgia, 'Times New Roman', serif" font-size="64">Bir taht, tek bir kişi için.</text>
    <text x="600" y="290" text-anchor="middle" fill="#9A8F80" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="32">A throne, made for one.</text>
    <line x1="570" y1="342" x2="630" y2="342" stroke="#B08D57" stroke-width="1.5"/>
    ${rings}
    <text x="600" y="576" text-anchor="middle" fill="#9A8F80" font-family="Helvetica, Arial, sans-serif" font-size="17" letter-spacing="6">YAKINDA · COMING SOON</text>
  </svg>`);
  await sharp(bg).composite(circles).jpeg({ quality: 86 }).toFile(path.join(out, OG_NAME));

  // Favicon / Apple ikon (eski monogram; site/public'ten kaldırıldıysa assets'teki mevcut dosyalar kalır)
  const mono = path.join(pub, "monogram.svg");
  if (fs.existsSync(mono)) {
    const icon = Buffer.from(fs.readFileSync(mono, "utf8"));
    await sharp(icon, { density: 400 }).resize(180, 180).png().toFile(path.join(out, "apple-touch-icon.png"));
    fs.copyFileSync(mono, path.join(out, "monogram.svg"));
  }

  for (const f of fs.readdirSync(out)) {
    const p = path.join(out, f);
    if (fs.statSync(p).isFile()) console.log(f, Math.round(fs.statSync(p).size / 1024) + " KB");
  }
})();
