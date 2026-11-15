/**
 * Yapay zekâ ile fotoğraftan üretilmiş bir koltuk GLB'sini siteye hazırlar (panelde yüklenince çalışır).
 *
 * Bu tür modellerde kumaş, kadife ve metal tek bir "boyalı" dokunun içindedir; sitede kumaş
 * değiştirilemez. Burada yüzler dokudaki renge ve yüksekliğe bakılarak üç parçaya ayrılır:
 *   Kumas  (sırt)   → sitede seçilen kumaşın dokusu sarılır (silindirik UV, metre ölçeğinde)
 *   Kadife (oturak) → kumaşın kadife rengi
 *   Metal  (gövde)  → koyu metal
 * Sonuç dokusuz, küçük bir GLB'dir: metre ölçeğinde, tabanı y=0'da, ortası x=z=0'da, önü +z yönünde.
 *
 * İçinde zaten "Kumas" adlı bir malzeme olan modeller (tasarımcının hazırladığı) olduğu gibi bırakılır.
 */
import sharp from "sharp";

export type PrepareOptions = {
  /** Koltuğun gerçek yüksekliği (m). */
  height: number;
  /** Sırt ile oturak arasındaki sınır, yüksekliğin oranı (0..1). */
  cut: number;
};

export type PrepareResult = { glb: Buffer; report: string; prepared: boolean };

type Gltf = {
  scene?: number;
  scenes?: { nodes?: number[] }[];
  nodes?: { mesh?: number; children?: number[]; matrix?: number[]; translation?: number[]; rotation?: number[]; scale?: number[] }[];
  meshes?: { primitives: { attributes: Record<string, number>; indices?: number; material?: number; mode?: number }[] }[];
  materials?: { name?: string; pbrMetallicRoughness?: { baseColorTexture?: { index: number }; baseColorFactor?: number[] } }[];
  textures?: { source?: number }[];
  images?: { bufferView?: number; uri?: string }[];
  accessors: { bufferView?: number; byteOffset?: number; componentType: number; count: number; type: string; normalized?: boolean }[];
  bufferViews: { byteOffset?: number; byteLength: number; byteStride?: number }[];
};

/** Kullanıcıya gösterilecek hata (panelde aynen görünür). */
export class ModelError extends Error {}

function parseGlb(buf: Buffer) {
  if (buf.length < 20 || buf.toString("utf8", 0, 4) !== "glTF") throw new ModelError("Dosya geçerli bir .glb değil.");
  const jlen = buf.readUInt32LE(12);
  const gltf = JSON.parse(buf.toString("utf8", 20, 20 + jlen)) as Gltf;
  const binStart = 20 + jlen + 8;
  const bin = buf.length > binStart ? buf.subarray(binStart, binStart + buf.readUInt32LE(20 + jlen)) : Buffer.alloc(0);
  return { gltf, bin };
}

/** Modelde tasarımcının adlandırdığı "Kumas" malzemesi var mı? */
export function hasNamedParts(buf: Buffer) {
  const { gltf } = parseGlb(buf);
  return (gltf.materials ?? []).some((m) => m.name === "Kumas");
}

/* ---------- 4×4 matris (sütun öncelikli, glTF gibi) ---------- */
type M4 = number[];
const I4 = (): M4 => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
function mul(a: M4, b: M4): M4 {
  const r = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) for (let rr = 0; rr < 4; rr++) for (let k = 0; k < 4; k++) r[c * 4 + rr] += a[k * 4 + rr] * b[c * 4 + k];
  return r;
}
function trs(t = [0, 0, 0], q = [0, 0, 0, 1], s = [1, 1, 1]): M4 {
  const [x, y, z, w] = q;
  const [sx, sy, sz] = s;
  return [
    (1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0,
    2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0,
    2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0,
    t[0], t[1], t[2], 1,
  ];
}

export async function prepareChairModel(input: Buffer, opts: PrepareOptions): Promise<PrepareResult> {
  const { gltf, bin } = parseGlb(input);

  const view = (i: number) => {
    const bv = gltf.bufferViews[i];
    return bin.subarray(bv.byteOffset ?? 0, (bv.byteOffset ?? 0) + bv.byteLength);
  };
  const accessor = (i: number): number[] => {
    const a = gltf.accessors[i];
    const n = ({ SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 } as Record<string, number>)[a.type];
    if (a.bufferView == null) return new Array(a.count * n).fill(0);
    const bv = gltf.bufferViews[a.bufferView];
    const v = view(a.bufferView);
    const size = ({ 5126: 4, 5125: 4, 5123: 2, 5122: 2, 5121: 1, 5120: 1 } as Record<number, number>)[a.componentType];
    const stride = bv.byteStride || size * n;
    const dv = new DataView(v.buffer, v.byteOffset + (a.byteOffset ?? 0));
    const out = new Array<number>(a.count * n);
    for (let i = 0; i < a.count; i++)
      for (let k = 0; k < n; k++) {
        const o = i * stride + k * size;
        let x: number;
        switch (a.componentType) {
          case 5126: x = dv.getFloat32(o, true); break;
          case 5125: x = dv.getUint32(o, true); break;
          case 5123: x = dv.getUint16(o, true); if (a.normalized) x /= 65535; break;
          case 5122: x = dv.getInt16(o, true); if (a.normalized) x = Math.max(x / 32767, -1); break;
          case 5121: x = dv.getUint8(o); if (a.normalized) x /= 255; break;
          default: x = dv.getInt8(o); if (a.normalized) x = Math.max(x / 127, -1);
        }
        out[i * n + k] = x;
      }
    return out;
  };

  /* ---------- Dokular (renk okumak için) ---------- */
  type Tex = { data: Buffer; W: number; H: number; Ipat: Float64Array; Ired: Float64Array; R: number };
  const texCache = new Map<number, Promise<Tex>>();
  const loadTex = (imgIndex: number) => {
    let p = texCache.get(imgIndex);
    if (!p) {
      p = (async () => {
        const img = gltf.images?.[imgIndex];
        let src: Buffer;
        if (img?.bufferView != null) src = view(img.bufferView);
        else if (img?.uri?.startsWith("data:")) src = Buffer.from(img.uri.split(",")[1], "base64");
        else throw new ModelError("Modelin dokusu dosyanın içinde değil; dokusu gömülü bir .glb yükleyin.");
        const { data, info } = await sharp(src).removeAlpha().resize(1024, 1024, { fit: "inside", withoutEnlargement: true }).raw().toBuffer({ resolveWithObject: true });
        const W = info.width;
        const H = info.height;
        const cls = new Uint8Array(W * H);
        for (let i = 0; i < W * H; i++) cls[i] = colorClass(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]);
        const integral = (k: number) => {
          const I = new Float64Array((W + 1) * (H + 1));
          for (let y = 0; y < H; y++) {
            let row = 0;
            for (let x = 0; x < W; x++) {
              row += cls[y * W + x] === k ? 1 : 0;
              I[(y + 1) * (W + 1) + x + 1] = I[y * (W + 1) + x + 1] + row;
            }
          }
          return I;
        };
        return { data, W, H, Ipat: integral(1), Ired: integral(2), R: Math.max(4, Math.round(W / 100)) };
      })();
      texCache.set(imgIndex, p);
    }
    return p;
  };
  const box = (t: Tex, I: Float64Array, x: number, y: number) => {
    const { W, H, R } = t;
    const x0 = Math.max(0, x - R), y0 = Math.max(0, y - R), x1 = Math.min(W, x + R + 1), y1 = Math.min(H, y + R + 1);
    return (I[y1 * (W + 1) + x1] - I[y0 * (W + 1) + x1] - I[y1 * (W + 1) + x0] + I[y0 * (W + 1) + x0]) / ((x1 - x0) * (y1 - y0));
  };
  /** Dokunun bu noktası kumaş/kadife gibi mi (true) yoksa metal mi? Kumaşın koyu zemini için çevresine de bakılır. */
  const softTex = (t: Tex, u: number, v: number) => {
    u -= Math.floor(u);
    v -= Math.floor(v);
    const x = Math.min(t.W - 1, Math.floor(u * t.W));
    const y = Math.min(t.H - 1, Math.floor(v * t.H));
    return box(t, t.Ipat, x, y) > 0.12 || box(t, t.Ired, x, y) > 0.3;
  };

  /* ---------- Tüm üçgenleri dünya koordinatında topla ---------- */
  const P: number[] = [];
  const UV: number[] = [];
  const COL: number[] = []; // köşe rengi (doku yoksa)
  const IDX: number[] = [];
  const faceTex: (Tex | null)[] = [];
  const faceColor: (number[] | null)[] = [];

  const visit = async (ni: number, parent: M4) => {
    const node = gltf.nodes?.[ni];
    if (!node) return;
    const m = mul(parent, node.matrix ?? trs(node.translation, node.rotation, node.scale));
    if (node.mesh != null)
      for (const prim of gltf.meshes?.[node.mesh]?.primitives ?? []) {
        if ((prim.mode ?? 4) !== 4 || prim.attributes.POSITION == null) continue;
        const base = P.length / 3;
        const pos = accessor(prim.attributes.POSITION);
        const count = pos.length / 3;
        for (let i = 0; i < count; i++) {
          const [x, y, z] = [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]];
          P.push(m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]);
        }
        const uv = prim.attributes.TEXCOORD_0 != null ? accessor(prim.attributes.TEXCOORD_0) : new Array(count * 2).fill(0);
        UV.push(...uv);
        const colN = prim.attributes.COLOR_0 != null ? ({ VEC3: 3, VEC4: 4 } as Record<string, number>)[gltf.accessors[prim.attributes.COLOR_0].type] : 0;
        const col = colN ? accessor(prim.attributes.COLOR_0) : [];
        for (let i = 0; i < count; i++) COL.push(colN ? col[i * colN] : 1, colN ? col[i * colN + 1] : 1, colN ? col[i * colN + 2] : 1);
        const mat = prim.material != null ? gltf.materials?.[prim.material] : undefined;
        const texIndex = mat?.pbrMetallicRoughness?.baseColorTexture?.index;
        const imgIndex = texIndex != null ? gltf.textures?.[texIndex]?.source : undefined;
        const tex = imgIndex != null ? await loadTex(imgIndex) : null;
        const factor = mat?.pbrMetallicRoughness?.baseColorFactor ?? [1, 1, 1, 1];
        const ind = prim.indices != null ? accessor(prim.indices) : [...Array(count).keys()];
        for (let t = 0; t < ind.length; t += 3) {
          IDX.push(base + ind[t], base + ind[t + 1], base + ind[t + 2]);
          faceTex.push(tex);
          faceColor.push(tex || colN ? null : factor);
        }
      }
    for (const c of node.children ?? []) await visit(c, m);
  };
  const roots = gltf.scenes?.[gltf.scene ?? 0]?.nodes ?? (gltf.nodes ?? []).map((_, i) => i);
  for (const r of roots) await visit(r, I4());

  const F = IDX.length / 3;
  if (!F) throw new ModelError("Modelde çizilecek yüzey bulunamadı.");
  if (!faceTex.some(Boolean) && !COL.some((c) => c !== 1) && new Set(faceColor.map((c) => c?.join())).size < 2)
    throw new ModelError("Modelde renk bilgisi yok (doku ya da renk); kumaş, oturak ve gövde ayrılamıyor.");

  /* ---------- Ölçek ---------- */
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3)
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], P[i + k]);
      max[k] = Math.max(max[k], P[i + k]);
    }
  const scale = opts.height / (max[1] - min[1] || 1);
  const cx = (min[0] + max[0]) / 2;
  const cz = (min[2] + max[2]) / 2;
  // Ön yön sonradan bulunur; şimdilik dönüşsüz
  let rotS = 0;
  let rotC = 1;
  // Yatay dönüş: (rotS, rotC) yönü +z'ye gelir
  const X = (i: number) => ((P[i * 3] - cx) * rotC - (P[i * 3 + 2] - cz) * rotS) * scale;
  const Y = (i: number) => (P[i * 3 + 1] - min[1]) * scale;
  const Z = (i: number) => ((P[i * 3] - cx) * rotS + (P[i * 3 + 2] - cz) * rotC) * scale;
  const yCut = opts.height * opts.cut;
  const faceY = (f: number) => (Y(IDX[f * 3]) + Y(IDX[f * 3 + 1]) + Y(IDX[f * 3 + 2])) / 3;

  /* ---------- Yüz etiketleri ---------- */
  const METAL = 0, KUMAS = 1, KADIFE = 2;
  const label = new Uint8Array(F);
  for (let f = 0; f < F; f++) {
    const [a, b, c] = [IDX[f * 3], IDX[f * 3 + 1], IDX[f * 3 + 2]];
    let soft: boolean;
    const tex = faceTex[f];
    if (tex) {
      const uc = (UV[a * 2] + UV[b * 2] + UV[c * 2]) / 3;
      const vc = (UV[a * 2 + 1] + UV[b * 2 + 1] + UV[c * 2 + 1]) / 3;
      let votes = softTex(tex, uc, vc) ? 1 : 0;
      for (const i of [a, b, c]) votes += softTex(tex, (UV[i * 2] + uc) / 2, (UV[i * 2 + 1] + vc) / 2) ? 1 : 0;
      soft = votes >= 2;
    } else {
      const col = faceColor[f] ?? [0, 1, 2].map((k) => (COL[a * 3 + k] + COL[b * 3 + k] + COL[c * 3 + k]) / 3);
      soft = colorClass(col[0] * 255, col[1] * 255, col[2] * 255) !== 0;
    }
    label[f] = !soft ? METAL : faceY(f) > yCut ? KUMAS : KADIFE;
  }

  /* ---------- Komşuluk (UV dikişlerinde ayrılmış köşeleri konuma göre birleştir) ---------- */
  const weldKey = new Map<string, number>();
  const weld = new Int32Array(P.length / 3);
  for (let i = 0; i < weld.length; i++) {
    const k = `${Math.round(P[i * 3] * 1e5)},${Math.round(P[i * 3 + 1] * 1e5)},${Math.round(P[i * 3 + 2] * 1e5)}`;
    if (!weldKey.has(k)) weldKey.set(k, weldKey.size);
    weld[i] = weldKey.get(k)!;
  }
  const edgeFaces = new Map<string, number[]>();
  for (let f = 0; f < F; f++)
    for (let e = 0; e < 3; e++) {
      const p = weld[IDX[f * 3 + e]], q = weld[IDX[f * 3 + ((e + 1) % 3)]];
      const k = p < q ? `${p}_${q}` : `${q}_${p}`;
      const list = edgeFaces.get(k);
      if (list) list.push(f);
      else edgeFaces.set(k, [f]);
    }
  const nbr: number[][] = Array.from({ length: F }, () => []);
  for (const list of edgeFaces.values()) for (const a of list) for (const b of list) if (a !== b) nbr[a].push(b);

  /** Aynı etiketli, birbirine değen yüz grupları. */
  const components = (only?: number) => {
    const comp = new Int32Array(F).fill(-1);
    const sizes: number[] = [];
    for (let s = 0; s < F; s++) {
      if (comp[s] >= 0 || (only != null && label[s] !== only)) continue;
      const id = sizes.length;
      const stack = [s];
      comp[s] = id;
      let n = 0;
      while (stack.length) {
        const f = stack.pop()!;
        n++;
        for (const g of nbr[f]) if (comp[g] < 0 && label[g] === label[s]) (comp[g] = id), stack.push(g);
      }
      sizes.push(n);
    }
    return { comp, sizes };
  };

  // Küçük adacıkları (sırttaki kırmızı gül, oturaktaki parlama…) çevresine kat
  const MIN_PART = Math.max(30, Math.round(F / 400));
  for (let pass = 0; pass < 4; pass++) {
    const { comp, sizes } = components();
    let changed = 0;
    for (let f = 0; f < F; f++) {
      if (sizes[comp[f]] >= MIN_PART) continue;
      const count = [0, 0, 0];
      for (const g of nbr[f]) if (label[g] !== label[f]) count[label[g]]++;
      const best = count.indexOf(Math.max(...count));
      if (count[best] > 0) (label[f] = best), changed++;
    }
    if (!changed) break;
  }

  // Kadife yalnızca oturaktır: en büyük kadife parçası dışındakiler, kumaşa değiyorsa kumaşa, değmiyorsa metale katılır
  {
    const { comp, sizes } = components(KADIFE);
    const seat = sizes.indexOf(Math.max(...sizes));
    const touches = new Map<number, boolean>();
    for (let f = 0; f < F; f++)
      if (comp[f] >= 0 && comp[f] !== seat && nbr[f].some((g) => label[g] === KUMAS)) touches.set(comp[f], true);
    for (let f = 0; f < F; f++) if (comp[f] >= 0 && comp[f] !== seat) label[f] = touches.get(comp[f]) ? KUMAS : METAL;
  }

  // Sırtın kenarında metal sanılan koyu şeritler: komşularının çoğu kumaşsa kumaş say (ince borular korunur)
  for (let pass = 0; pass < 12; pass++) {
    const flip: number[] = [];
    for (let f = 0; f < F; f++) {
      if (label[f] !== METAL || faceY(f) <= yCut || !nbr[f].length) continue;
      if (nbr[f].filter((g) => label[g] === KUMAS).length / nbr[f].length >= 0.5) flip.push(f);
    }
    if (!flip.length) break;
    for (const f of flip) label[f] = KUMAS;
  }

  const count = [0, 0, 0];
  for (let f = 0; f < F; f++) count[label[f]]++;
  if (count[KUMAS] < F * 0.03)
    throw new ModelError(
      "Modelde sırt kumaşı bulunamadı. Sırtı desenli kumaşla kaplı bir koltuk görseli kullanın ya da \"Sırtın başladığı yükseklik\" değerini küçültüp dosyayı yeniden yükleyin.",
    );

  /* ---------- Ön yönü bul: oturak sırtın önündedir ---------- */
  const centroid = (l: number) => {
    let x = 0, z = 0, n = 0;
    for (let f = 0; f < F; f++)
      if (label[f] === l)
        for (let e = 0; e < 3; e++) {
          const i = IDX[f * 3 + e];
          x += P[i * 3] - cx;
          z += P[i * 3 + 2] - cz;
          n++;
        }
    return n ? [x / n, z / n] : [0, 0];
  };
  {
    const [kx, kz] = centroid(KUMAS);
    const [sx, sz] = count[KADIFE] ? centroid(KADIFE) : [0, 0];
    const dx = sx - kx, dz = sz - kz;
    const len = Math.hypot(dx, dz);
    if (len > 1e-6) {
      // (dx, dz) yönünü +z'ye çevir; modeller genelde eksenlere hizalı geldiği için en yakın 90°'ye yuvarla
      const a = Math.round(Math.atan2(dx, dz) / (Math.PI / 2)) * (Math.PI / 2);
      rotS = Math.round(Math.sin(a));
      rotC = Math.round(Math.cos(a));
    }
  }

  /* ---------- Sırt kumaşının silindir ekseni ve yarıçapı ---------- */
  let axisZ = 0;
  let rad = 0;
  {
    let z = 0, n = 0;
    for (let f = 0; f < F; f++) if (label[f] === KUMAS) (z += Z(IDX[f * 3])), n++;
    axisZ = n ? z / n : 0;
    let r = 0;
    for (let f = 0; f < F; f++) if (label[f] === KUMAS) r += Math.hypot(X(IDX[f * 3]), Z(IDX[f * 3]) - axisZ);
    // Ortalama noktası kabuğun arkasında kalır; ekseni biraz öne al
    axisZ += 0.5 * (n ? r / n : 0);
    r = 0;
    for (let f = 0; f < F; f++) if (label[f] === KUMAS) r += Math.hypot(X(IDX[f * 3]), Z(IDX[f * 3]) - axisZ);
    rad = n ? r / n : 0.3;
  }

  const faceNormal = (f: number) => {
    const [a, b, c] = [IDX[f * 3], IDX[f * 3 + 1], IDX[f * 3 + 2]];
    const ux = X(b) - X(a), uy = Y(b) - Y(a), uz = Z(b) - Z(a);
    const vx = X(c) - X(a), vy = Y(c) - Y(a), vz = Z(c) - Z(a);
    return [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx]; // uzunluğu alanla orantılı
  };
  // Yumuşak normaller: köşe konumuna göre, değen tüm yüzlerin ortalaması
  const weldNormal = new Float64Array(weldKey.size * 3);
  for (let f = 0; f < F; f++) {
    const n = faceNormal(f);
    for (let e = 0; e < 3; e++) {
      const w = weld[IDX[f * 3 + e]];
      for (let k = 0; k < 3; k++) weldNormal[w * 3 + k] += n[k];
    }
  }

  /**
   * Kumaş UV'si (metre). Sırt bir silindir parçası gibi açılır: u = sırtın ortasından yay uzunluğu, v = yükseklik.
   * Silindire dik bakan yüzlerde (uçlar, üst/alt kenar) kalınlık yönü de hesaba katılır; yoksa kumaş çizgi çizgi uzar.
   *   0: yan yüz (iç/dış)  1: üst/alt kenar  2: uç
   */
  const fabricSide = (f: number) => {
    const n = faceNormal(f);
    const l = Math.hypot(n[0], n[1], n[2]) || 1;
    const [a, b, c] = [IDX[f * 3], IDX[f * 3 + 1], IDX[f * 3 + 2]];
    const mx = (X(a) + X(b) + X(c)) / 3, mz = (Z(a) + Z(b) + Z(c)) / 3 - axisZ;
    const ml = Math.hypot(mx, mz) || 1;
    const radial = Math.abs((n[0] * mx + n[2] * mz) / ml) / l;
    const up = Math.abs(n[1]) / l;
    if (radial >= Math.max(up, 0.5)) return 0;
    return up >= Math.sqrt(Math.max(0, 1 - radial * radial - up * up)) ? 1 : 2;
  };
  const fabricUV = (i: number, side: number) => {
    const x = X(i), y = Y(i), z = Z(i) - axisZ;
    const theta = Math.atan2(x, -z); // 0: tam arkası
    const dr = Math.hypot(x, z) - rad;
    if (side === 1) return [theta * rad, y + dr];
    if (side === 2) return [theta * rad + Math.sign(theta) * dr, y];
    return [theta * rad, y];
  };

  /**
   * Kadife UV'si (metre), kutu izdüşümü: her yüz baktığı eksene göre düz açılır
   * (üst/alt → x,z; yanlar → x,y ya da z,y). Sitede kadifenin hav dokusu bununla sarılır.
   */
  const velvetSide = (f: number) => {
    const n = faceNormal(f).map(Math.abs);
    return n[1] >= n[0] && n[1] >= n[2] ? 0 : n[0] >= n[2] ? 1 : 2;
  };
  const velvetUV = (i: number, side: number) => (side === 0 ? [X(i), Z(i)] : side === 1 ? [Z(i), Y(i)] : [X(i), Y(i)]);

  /* ---------- Parçaları kur ---------- */
  const parts = [
    { name: "Metal", color: [0.03, 0.03, 0.035, 1], metallic: 0.55, rough: 0.35 },
    { name: "Kumas", color: [1, 1, 1, 1], metallic: 0, rough: 0.85 },
    { name: "Kadife", color: [0.45, 0.05, 0.07, 1], metallic: 0, rough: 0.9 },
  ].map((p, li) => {
    const map = new Map<number, number>();
    const pos: number[] = [];
    const nrm: number[] = [];
    const uv: number[] = [];
    const ind: number[] = [];
    for (let f = 0; f < F; f++) {
      if (label[f] !== li) continue;
      const side = li === KUMAS ? fabricSide(f) : li === KADIFE ? velvetSide(f) : 0;
      for (let e = 0; e < 3; e++) {
        const i = IDX[f * 3 + e];
        const w = weld[i];
        const key = w * 4 + side; // UV'si farklı olan kenarlarda köşe ayrılır, normal ortak kalır
        let v = map.get(key);
        if (v == null) {
          v = pos.length / 3;
          map.set(key, v);
          pos.push(X(i), Y(i), Z(i));
          const l = Math.hypot(weldNormal[w * 3], weldNormal[w * 3 + 1], weldNormal[w * 3 + 2]) || 1;
          nrm.push(weldNormal[w * 3] / l, weldNormal[w * 3 + 1] / l, weldNormal[w * 3 + 2] / l);
          if (li === KUMAS) uv.push(...fabricUV(i, side));
          else if (li === KADIFE) uv.push(...velvetUV(i, side));
        }
        ind.push(v);
      }
    }
    return { ...p, pos, nrm, uv, ind };
  });

  const piping = buildPiping();
  if (piping.ind.length) parts.push(piping);

  /**
   * Biye: döşemenin kenarlarındaki ince siyah şerit. Yapay zekâ modellerinde yalnızca dokuya
   * boyanmış olur; burada gerçek bir ince boru olarak çizilir.
   *  - Oturak: üst yüzün çevresi (üst yüz ile yanların birleştiği kenar).
   *  - Sırt: iç ve dış yüzün çevresi (üst/alt kenar ve uçlarla birleştiği çizgiler).
   */
  function buildPiping() {
    const RADIUS = 0.0035;
    const STEP = 0.01;
    /** Bundan kısa çizgiler (gül, parlama gibi küçük adacıkların çevresi) biye değildir. */
    const MIN_LEN = 0.6;
    // Biyenin çevresinden geçeceği yüzler
    const inner = new Uint8Array(F);
    for (let f = 0; f < F; f++) {
      if (label[f] === KADIFE) {
        const n = faceNormal(f);
        inner[f] = n[1] / (Math.hypot(n[0], n[1], n[2]) || 1) > 0.55 ? 1 : 0; // oturağın üst yüzü
      } else if (label[f] === KUMAS) inner[f] = fabricSide(f) === 0 ? 2 : 0; // sırtın iç/dış yüzü
    }
    // Bu yüzlerin dış sınırındaki kenarlar
    const rep = new Int32Array(weldKey.size);
    for (let i = 0; i < weld.length; i++) rep[weld[i]] = i;
    const adj = new Map<number, number[]>();
    const edges: [number, number][] = [];
    for (const [k, list] of edgeFaces) {
      const kinds = new Set(list.map((f) => inner[f]));
      const g = [...kinds].find((x) => x > 0);
      if (!g || list.every((f) => inner[f] === g)) continue;
      const [p, q] = k.split("_").map(Number);
      const e = edges.length;
      edges.push([p, q]);
      for (const v of [p, q]) (adj.get(v) ?? adj.set(v, []).get(v)!).push(e);
    }
    // Kenarları uç uca ekleyip çizgilere çevir
    const used = new Uint8Array(edges.length);
    const lines: { pts: number[][]; closed: boolean }[] = [];
    for (let s = 0; s < edges.length; s++) {
      if (used[s]) continue;
      used[s] = 1;
      const chain = [edges[s][0], edges[s][1]];
      for (const dir of [1, 0]) {
        for (;;) {
          const end = dir ? chain[chain.length - 1] : chain[0];
          const next = (adj.get(end) ?? []).find((e) => !used[e]);
          if (next == null) break;
          used[next] = 1;
          const v = edges[next][0] === end ? edges[next][1] : edges[next][0];
          if (dir) chain.push(v);
          else chain.unshift(v);
        }
      }
      const closed = chain[0] === chain[chain.length - 1];
      if (closed) chain.pop();
      const pts = chain.map((w) => {
        const i = rep[w];
        const l = Math.hypot(weldNormal[w * 3], weldNormal[w * 3 + 1], weldNormal[w * 3 + 2]) || 1;
        return [X(i), Y(i), Z(i), weldNormal[w * 3] / l, weldNormal[w * 3 + 1] / l, weldNormal[w * 3 + 2] / l];
      });
      lines.push({ pts, closed });
    }

    const pos: number[] = [];
    const nrm: number[] = [];
    const ind: number[] = [];
    const SEG = 6;
    for (const { pts, closed } of lines) {
      // Eşit aralıklarla yeniden örnekle
      const src = closed ? [...pts, pts[0]] : pts;
      let len = 0;
      for (let i = 1; i < src.length; i++) len += Math.hypot(src[i][0] - src[i - 1][0], src[i][1] - src[i - 1][1], src[i][2] - src[i - 1][2]);
      if (len < MIN_LEN) continue;
      const n = Math.max(4, Math.round(len / STEP));
      let res: number[][] = [];
      let seg = 1, acc = 0;
      let segLen = Math.hypot(src[1][0] - src[0][0], src[1][1] - src[0][1], src[1][2] - src[0][2]);
      for (let k = 0; k < (closed ? n : n + 1); k++) {
        const d = (k * len) / n;
        while (acc + segLen < d && seg < src.length - 1) {
          acc += segLen;
          seg++;
          segLen = Math.hypot(src[seg][0] - src[seg - 1][0], src[seg][1] - src[seg - 1][1], src[seg][2] - src[seg - 1][2]);
        }
        const t = segLen ? Math.min(1, (d - acc) / segLen) : 0;
        res.push(src[seg - 1].map((v, j) => v + (src[seg][j] - v) * t));
      }
      // Üçgen kenarlarının zikzakını yumuşat
      const W = 6;
      for (let pass = 0; pass < 3; pass++) {
        res = res.map((_, i) => {
          const sum = [0, 0, 0, 0, 0, 0];
          let c = 0;
          for (let j = -W; j <= W; j++) {
            let k = i + j;
            if (closed) k = (k + res.length) % res.length;
            else if (k < 0 || k >= res.length) continue;
            for (let m = 0; m < 6; m++) sum[m] += res[k][m];
            c++;
          }
          return sum.map((v) => v / c);
        });
      }
      // Boru: yüzeyin hemen üstünde, kesiti 6 köşeli halka
      const base = pos.length / 3;
      const count = res.length;
      for (let i = 0; i < count; i++) {
        const a = res[closed ? (i - 1 + count) % count : Math.max(0, i - 1)];
        const b = res[closed ? (i + 1) % count : Math.min(count - 1, i + 1)];
        const t = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
        const tl = Math.hypot(t[0], t[1], t[2]) || 1;
        t.forEach((_, j) => (t[j] /= tl));
        const sn = res[i].slice(3, 6);
        const dot = sn[0] * t[0] + sn[1] * t[1] + sn[2] * t[2];
        const u = [sn[0] - t[0] * dot, sn[1] - t[1] * dot, sn[2] - t[2] * dot];
        const ul = Math.hypot(u[0], u[1], u[2]) || 1;
        u.forEach((_, j) => (u[j] /= ul));
        const v = [t[1] * u[2] - t[2] * u[1], t[2] * u[0] - t[0] * u[2], t[0] * u[1] - t[1] * u[0]];
        const c = res[i].slice(0, 3).map((x, j) => x + u[j] * RADIUS * 0.4);
        for (let s = 0; s < SEG; s++) {
          const ang = (s / SEG) * Math.PI * 2;
          const d = [0, 1, 2].map((j) => Math.cos(ang) * u[j] + Math.sin(ang) * v[j]);
          pos.push(c[0] + d[0] * RADIUS, c[1] + d[1] * RADIUS, c[2] + d[2] * RADIUS);
          nrm.push(d[0], d[1], d[2]);
        }
      }
      const rings = closed ? count : count - 1;
      for (let i = 0; i < rings; i++) {
        const r0 = base + i * SEG;
        const r1 = base + ((i + 1) % count) * SEG;
        for (let s = 0; s < SEG; s++) {
          const s1 = (s + 1) % SEG;
          ind.push(r0 + s, r1 + s, r0 + s1, r1 + s, r1 + s1, r0 + s1);
        }
      }
    }
    return { name: "Biye", color: [0.015, 0.015, 0.015, 1], metallic: 0, rough: 0.55, pos, nrm, uv: [] as number[], ind };
  }

  const glb = writeGlb(parts);
  const span = (get: (i: number) => number) => {
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < P.length / 3; i++) (lo = Math.min(lo, get(i))), (hi = Math.max(hi, get(i)));
    return ((hi - lo) * 100).toFixed(0);
  };
  const size = [span(X), span(Z)];
  const pct = (n: number) => `%${Math.round((n / F) * 100)}`;
  const report =
    `Model parçalara ayrıldı: sırt kumaşı ${pct(count[KUMAS])}, oturak kadifesi ${pct(count[KADIFE])}, metal gövde ${pct(count[METAL])}.\n` +
    `Ölçü: yaklaşık ${size[0]} × ${size[1]} × ${(opts.height * 100).toFixed(0)} cm (genişlik × derinlik × yükseklik). Dosya ${(glb.length / 1024).toFixed(0)} KB.` +
    (count[KADIFE] ? "" : "\nUyarı: oturak kadifesi bulunamadı; oturak metal renginde görünür.");
  return { glb, report, prepared: true };
}

/** 0: nötr (metal), 1: desen (yeşil/altın/mavi tonlar), 2: kırmızı tonlar */
function colorClass(R: number, G: number, B: number) {
  const r = R / 255, g = G / 255, b = B / 255;
  const mx = Math.max(r, g, b), d = mx - Math.min(r, g, b);
  const s = mx ? d / mx : 0;
  if (mx < 0.05 || s < 0.35) return 0;
  let h = 0;
  if (d) h = (((mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60) + 360) % 360;
  if (h < 22 || h > 335) return 2;
  if (h >= 30 && h < 200) return 1;
  return 0;
}

type Part = { name: string; color: number[]; metallic: number; rough: number; pos: number[]; nrm: number[]; uv: number[]; ind: number[] };

function writeGlb(parts: Part[]) {
  const chunks: Buffer[] = [];
  let offset = 0;
  const out = {
    asset: { version: "2.0", generator: "tahtirevan chairModel" },
    scene: 0,
    scenes: [{ nodes: [] as number[] }],
    nodes: [] as object[],
    meshes: [] as object[],
    materials: [] as object[],
    accessors: [] as object[],
    bufferViews: [] as object[],
    buffers: [] as object[],
  };
  const addView = (typed: Float32Array | Uint32Array | Uint16Array, target: number) => {
    const b = Buffer.from(typed.buffer, typed.byteOffset, typed.byteLength);
    const pad = (4 - (b.length % 4)) % 4;
    out.bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: b.length, target });
    chunks.push(b, Buffer.alloc(pad));
    offset += b.length + pad;
    return out.bufferViews.length - 1;
  };
  const addAccessor = (arr: number[], type: "SCALAR" | "VEC2" | "VEC3", isIndex = false) => {
    const n = { SCALAR: 1, VEC2: 2, VEC3: 3 }[type];
    // Köşe sayısı küçükse indisler 16 bit (dosya küçülür)
    const short = isIndex && arr.every((v) => v < 65536);
    const typed = isIndex ? (short ? new Uint16Array(arr) : new Uint32Array(arr)) : new Float32Array(arr);
    const componentType = isIndex ? (short ? 5123 : 5125) : 5126;
    const a: Record<string, unknown> = { bufferView: addView(typed, isIndex ? 34963 : 34962), componentType, count: arr.length / n, type };
    if (type === "VEC3" && !isIndex) {
      const mn = [Infinity, Infinity, Infinity];
      const mx = [-Infinity, -Infinity, -Infinity];
      for (let i = 0; i < arr.length; i++) {
        mn[i % 3] = Math.min(mn[i % 3], arr[i]);
        mx[i % 3] = Math.max(mx[i % 3], arr[i]);
      }
      a.min = mn;
      a.max = mx;
    }
    out.accessors.push(a);
    return out.accessors.length - 1;
  };
  for (const part of parts) {
    if (!part.ind.length) continue;
    const attributes: Record<string, number> = { POSITION: addAccessor(part.pos, "VEC3"), NORMAL: addAccessor(part.nrm, "VEC3") };
    if (part.uv.length) attributes.TEXCOORD_0 = addAccessor(part.uv, "VEC2");
    out.materials.push({
      name: part.name,
      pbrMetallicRoughness: { baseColorFactor: part.color, metallicFactor: part.metallic, roughnessFactor: part.rough },
      doubleSided: part.name === "Kumas",
    });
    out.meshes.push({ name: part.name, primitives: [{ attributes, indices: addAccessor(part.ind, "SCALAR", true), material: out.materials.length - 1 }] });
    out.nodes.push({ name: part.name, mesh: out.meshes.length - 1 });
    out.scenes[0].nodes.push(out.nodes.length - 1);
  }
  const binBuf = Buffer.concat(chunks);
  out.buffers.push({ byteLength: binBuf.length });
  let json = Buffer.from(JSON.stringify(out));
  json = Buffer.concat([json, Buffer.alloc((4 - (json.length % 4)) % 4, 0x20)]);
  const header = Buffer.alloc(12);
  header.write("glTF", 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + json.length + 8 + binBuf.length, 8);
  const ch = (len: number, type: string) => {
    const b = Buffer.alloc(8);
    b.writeUInt32LE(len, 0);
    b.write(type, 4);
    return b;
  };
  return Buffer.concat([header, ch(json.length, "JSON"), json, ch(binBuf.length, "BIN\0"), binBuf]);
}
