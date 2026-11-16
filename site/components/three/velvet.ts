/**
 * Kadife oturak malzemesi. Kadifeyi tanıtan iki şey var:
 *  - Kenarlarda ışığı yakalayan parlama (sheen): yüzey gözden uzaklaştıkça açık bir hale.
 *  - "Ezik" hav: lifler farklı yönlere yattığı için ışığa göre açılıp koyulaşan lekeler; koltuk dönünce kayar.
 * Dokular kodla, bir kez üretilir (indirilecek dosya yok). Modelin Kadife parçasının UV'si metredir
 * (`payload/chairModel.ts` → kutu izdüşümü).
 */
import * as THREE from "three";

/** Döşenebilir (kenarları birbirine uyan) değer gürültüsü; birkaç katman üst üste. */
function tileNoise(size: number, cells: number, octaves: number, seed: number, stretch = 1) {
  const out = new Float32Array(size * size);
  let amp = 1;
  let total = 0;
  for (let o = 0; o < octaves; o++) {
    const gx = cells << o;
    const gy = Math.max(1, Math.round((cells << o) / stretch));
    const lattice = new Float32Array(gx * gy);
    let s = (seed + o * 7919) >>> 0;
    for (let i = 0; i < lattice.length; i++) {
      s = (s * 1664525 + 1013904223) >>> 0;
      lattice[i] = s / 4294967296;
    }
    for (let y = 0; y < size; y++) {
      const fy = (y / size) * gy;
      const y0 = Math.floor(fy);
      const ty = fy - y0;
      const sy = ty * ty * (3 - 2 * ty);
      for (let x = 0; x < size; x++) {
        const fx = (x / size) * gx;
        const x0 = Math.floor(fx);
        const tx = fx - x0;
        const sx = tx * tx * (3 - 2 * tx);
        const a = lattice[(y0 % gy) * gx + (x0 % gx)];
        const b = lattice[(y0 % gy) * gx + ((x0 + 1) % gx)];
        const c = lattice[((y0 + 1) % gy) * gx + (x0 % gx)];
        const d = lattice[((y0 + 1) % gy) * gx + ((x0 + 1) % gx)];
        out[y * size + x] += amp * (a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy);
      }
    }
    total += amp;
    amp *= 0.5;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

function dataTexture(data: Uint8Array, size: number, srgb: boolean, repeat: number) {
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

let maps: { crush: THREE.DataTexture; tone: THREE.DataTexture; pile: THREE.DataTexture } | null = null;

/** Oturum boyunca bir kez üretilir. */
function velvetMaps() {
  if (maps) return maps;
  // Ezik hav: geniş, yumuşak, belli belirsiz dalgalar (bir tekrarı ~12 cm). Eskiden kontrastlı ve
  // benekliydi (ton %60–90, parlama %20–100); oturak lekeli, "kirli" görünüyordu. Kadife temiz durmalı.
  const S1 = 256;
  const n = tileNoise(S1, 2, 2, 11, 1.2);
  const crush = new Uint8Array(S1 * S1 * 4);
  const tone = new Uint8Array(S1 * S1 * 4);
  for (let i = 0; i < S1 * S1; i++) {
    const v = Math.min(1, Math.max(0, n[i]));
    const c = Math.round(255 * (0.8 + 0.2 * v)); // parlamanın gücü: hafif oynar
    const t = Math.round(255 * (0.93 + 0.07 * v)); // renk tonu: neredeyse düz
    crush.set([c, c, c, 255], i * 4);
    tone.set([t, t, t, 255], i * 4);
  }
  // Hav lifleri: ince, sık gürültüden normal haritası (bir tekrarı ~4 cm)
  const S2 = 256;
  const h = tileNoise(S2, 32, 3, 29);
  const pile = new Uint8Array(S2 * S2 * 4);
  const at = (x: number, y: number) => h[((y + S2) % S2) * S2 + ((x + S2) % S2)];
  for (let y = 0; y < S2; y++)
    for (let x = 0; x < S2; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * 6;
      const dy = (at(x, y + 1) - at(x, y - 1)) * 6;
      const l = Math.hypot(dx, dy, 1);
      pile.set([Math.round((-dx / l) * 127.5 + 127.5), Math.round((-dy / l) * 127.5 + 127.5), Math.round((1 / l) * 127.5 + 127.5), 255], (y * S2 + x) * 4);
    }
  maps = {
    crush: dataTexture(crush, S1, true, 1 / 0.12),
    tone: dataTexture(tone, S1, true, 1 / 0.12),
    pile: dataTexture(pile, S2, false, 1 / 0.04),
  };
  return maps;
}

const hsl = { h: 0, s: 0, l: 0 };

/**
 * Parlamanın rengi: kadife renginin daha doygun ve açık hali. Beyaza karıştırılınca
 * kırmızı kadife pembeleşiyordu; gerçek kadifede ışık rengin kendisini parlatır.
 */
export function velvetSheen(color: THREE.ColorRepresentation, target = new THREE.Color()) {
  target.set(color).getHSL(hsl);
  return target.setHSL(hsl.h, Math.min(1, hsl.s * 1.1 + 0.08), Math.min(0.46, hsl.l + 0.16));
}

export function createVelvetMaterial(color: THREE.ColorRepresentation) {
  const m = velvetMaps();
  return new THREE.MeshPhysicalMaterial({
    color,
    map: m.tone,
    roughness: 0.92,
    sheen: 1,
    sheenRoughness: 0.5,
    sheenColor: velvetSheen(color),
    sheenColorMap: m.crush,
    normalMap: m.pile,
    normalScale: new THREE.Vector2(0.26, 0.26),
  });
}
