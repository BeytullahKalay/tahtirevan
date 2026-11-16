// Kamera mı hareket ediyor, nesne mi? Ardışık karelerde seçilen bölgelerin
// (duvar, pencere, vazo, koltuk...) kaç piksel kaydığını blok eşleştirmeyle ölçer.
// Duvar/pencere kayıyorsa kamera hareket ediyordur; duvar sabit, koltuk
// kayıyor/dönüyorsa "döner tabla" hatası vardır.
// Kullanım:
//   node hareket-olc.cjs bolgeler.json kare0.png kare1.png ...
// bolgeler.json: [{"ad":"duvar-sag","x":0.7,"y":0.1,"w":0.2,"h":0.15}, ...]  (kesirler)
// Çıktı: her bölge için kareden kareye (dx, dy) piksel ve toplam kayma (kare genişliğine göre %).
const fs = require("fs");
const path = require("path");
const sharp = require(path.join(__dirname, "../../site/node_modules/sharp"));

const OLCEK = 360; // eşleştirme genişliği (px)
const ARAMA = 24; // ± arama yarıçapı (px)

async function gri(f) {
  const { data, info } = await sharp(f).resize({ width: OLCEK }).grayscale().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
}

function eslestir(A, B, b) {
  const x0 = Math.round(b.x * A.w), y0 = Math.round(b.y * A.h);
  const bw = Math.round(b.w * A.w), bh = Math.round(b.h * A.h);
  let en = Infinity, ex = 0, ey = 0;
  for (let dy = -ARAMA; dy <= ARAMA; dy++) for (let dx = -ARAMA; dx <= ARAMA; dx++) {
    let s = 0, n = 0;
    for (let y = 0; y < bh; y += 2) {
      const ya = y0 + y, yb = ya + dy;
      if (yb < 0 || yb >= B.h) continue;
      for (let x = 0; x < bw; x += 2) {
        const xa = x0 + x, xb = xa + dx;
        if (xb < 0 || xb >= B.w) continue;
        s += Math.abs(A.d[ya * A.w + xa] - B.d[yb * B.w + xb]); n++;
      }
    }
    if (n && s / n < en) { en = s / n; ex = dx; ey = dy; }
  }
  return [ex, ey, en];
}

(async () => {
  const [bf, ...kareler] = process.argv.slice(2);
  const bolgeler = JSON.parse(fs.readFileSync(bf, "utf8"));
  const G = [];
  for (const k of kareler) G.push(await gri(k));
  for (const b of bolgeler) {
    let tx = 0, ty = 0; const adim = [];
    for (let i = 1; i < G.length; i++) {
      // bölgeyi kayan konumuyla izle
      const bb = { ...b, x: b.x + tx / G[0].w, y: b.y + ty / G[0].h };
      const [dx, dy, e] = eslestir(G[i - 1], G[i], bb);
      tx += dx; ty += dy; adim.push(`(${dx},${dy} e${e.toFixed(0)})`);
    }
    console.log(`${b.ad.padEnd(12)} toplam dx=${tx} dy=${ty} px  (${(100 * tx / G[0].w).toFixed(1)}% , ${(100 * ty / G[0].w).toFixed(1)}%)  adimlar ${adim.join(" ")}`);
  }
})();
