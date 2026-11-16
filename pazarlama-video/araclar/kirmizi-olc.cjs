// Kumaşın kırmızısını ölçer. "Önce" karesindeki kırmızı kumaş piksellerini seçer,
// AYNI piksellerin "sonra" karesindeki değerleriyle karşılaştırır (ceviz ağaç
// renk değiştirip ölçüme karışmasın diye maske yalnızca önceki kareden alınır).
//   ton: derece; 0 = saf kırmızı, eksi = kiraz/mor tarafı, artı = turuncu tarafı
//   doygunluk, parlaklık: 0..1
//   griRGB: odanın gri duvarı (renk sapmasını görmek için)
// Kullanım: node kirmizi-olc.cjs once.png sonra.png [sonra2.png ...]
const path = require("path");
const sharp = require(path.join(__dirname, "../../site/node_modules/sharp"));

function hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60; if (h > 180) h -= 360;
  return [h, s, l];
}

async function oku(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, c: info.channels };
}

function olc({ data, c }, maske) {
  let n = 0, hs = 0, ss = 0, ls = 0, gn = 0, gr = 0, gg = 0, gb = 0;
  for (let p = 0, i = 0; i < data.length; i += c, p++) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (maske[p] === 1) { const [h, s, l] = hsl(r, g, b); n++; hs += h; ss += s; ls += l; }
    else if (maske[p] === 2) { gn++; gr += r; gg += g; gb += b; }
  }
  return {
    ton: +(hs / n).toFixed(2), doygunluk: +(ss / n).toFixed(3), parlaklik: +(ls / n).toFixed(3),
    griRGB: gn ? [gr / gn, gg / gn, gb / gn].map((v) => +v.toFixed(1)) : null,
  };
}

(async () => {
  const [a, ...rest] = process.argv.slice(2);
  const A = await oku(a);
  const maske = new Uint8Array(A.data.length / A.c);
  let kn = 0;
  for (let p = 0, i = 0; i < A.data.length; i += A.c, p++) {
    const [h, s, l] = hsl(A.data[i], A.data[i + 1], A.data[i + 2]);
    if (s > 0.35 && l > 0.12 && l < 0.7 && h > -25 && h < 10) { maske[p] = 1; kn++; }
    else if (s < 0.08 && l > 0.35 && l < 0.85) maske[p] = 2;
  }
  const a0 = olc(A, maske);
  console.log(`once  (${kn} kirmizi piksel) ${JSON.stringify(a0)}`);
  for (const f of rest) {
    const b0 = olc(await oku(f), maske);
    console.log(`${path.basename(f)}: ${JSON.stringify(b0)}  ton kaymasi ${(b0.ton - a0.ton).toFixed(2)} derece, doygunluk ${((b0.doygunluk / a0.doygunluk - 1) * 100).toFixed(1)} %`);
  }
})();
