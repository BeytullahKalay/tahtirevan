// Coming-soon görsellerini üretir: koltuk webp, kumaş numuneleri, OG görseli, favicon PNG.
const path = require("path");
const fs = require("fs");
const root = process.argv[2]; // proje kökü
const sharp = require(path.join(root, "site/node_modules/sharp"));
const pub = path.join(root, "site/public");
const out = path.join(root, "coming-soon/assets");
fs.mkdirSync(path.join(out, "fabrics"), { recursive: true });

(async () => {
  const chairSrc = path.join(pub, "chair/serir.png");
  const meta = await sharp(chairSrc).metadata();
  console.log("chair", meta.width, meta.height, "alpha:", meta.hasAlpha);

  await sharp(chairSrc).resize({ width: 820 }).webp({ quality: 82, alphaQuality: 90 }).toFile(path.join(out, "chair.webp"));
  await sharp(chairSrc).resize({ width: 520 }).webp({ quality: 80, alphaQuality: 90 }).toFile(path.join(out, "chair-sm.webp"));

  const ids = ["rossaria", "colibri", "sahara", "ardente", "panthera", "mayura", "soraya", "mirza", "zafran", "sapphire", "simur"];
  for (const id of ids) {
    await sharp(path.join(pub, "fabrics", id + ".jpg"))
      .resize({ width: 360, height: 360, fit: "cover" })
      .webp({ quality: 74 })
      .toFile(path.join(out, "fabrics", id + ".webp"));
  }

  // OG 1200x630: koyu zemin, solda koltuk, sağda yazı
  const chairOg = await sharp(chairSrc).resize({ height: 540 }).png().toBuffer();
  const cm = await sharp(chairOg).metadata();
  const text = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs><radialGradient id="g" cx="0.3" cy="0.45" r="0.6"><stop offset="0" stop-color="#3a1a1c" stop-opacity="0.9"/><stop offset="1" stop-color="#14110F" stop-opacity="0"/></radialGradient></defs>
    <rect width="1200" height="630" fill="#14110F"/><rect width="1200" height="630" fill="url(#g)"/>
    <ellipse cx="${60 + cm.width / 2}" cy="562" rx="${cm.width * 0.4}" ry="12" fill="#000" opacity="0.55"/>
    <text x="640" y="250" fill="#E9E1D3" font-family="Helvetica, Arial, sans-serif" font-size="22" letter-spacing="11">TAHTIREVAN</text>
    <text x="640" y="330" fill="#E9E1D3" font-family="Georgia, 'Times New Roman', serif" font-size="54">A throne,</text>
    <text x="640" y="395" fill="#E9E1D3" font-family="Georgia, 'Times New Roman', serif" font-size="54">made for one.</text>
    <line x1="640" y1="440" x2="700" y2="440" stroke="#B08D57" stroke-width="1.5"/>
    <text x="640" y="480" fill="#9A8F80" font-family="Helvetica, Arial, sans-serif" font-size="18" letter-spacing="6">YAKINDA · COMING SOON</text>
  </svg>`);
  await sharp(text)
    .composite([{ input: chairOg, left: 60, top: 40 }])
    .jpeg({ quality: 84 })
    .toFile(path.join(out, "og.jpg"));

  // Favicon / Apple ikon
  const icon = Buffer.from(fs.readFileSync(path.join(pub, "monogram.svg"), "utf8"));
  await sharp(icon, { density: 400 }).resize(180, 180).png().toFile(path.join(out, "apple-touch-icon.png"));
  fs.copyFileSync(path.join(pub, "monogram.svg"), path.join(out, "monogram.svg"));

  for (const f of fs.readdirSync(out)) {
    const p = path.join(out, f);
    if (fs.statSync(p).isFile()) console.log(f, Math.round(fs.statSync(p).size / 1024) + " KB");
  }
})();
