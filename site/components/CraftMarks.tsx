import type { ReactNode } from "react";
import type { Lang } from "@/lib/i18n";
import { Reveal } from "./Reveal";

const COPY = {
  tr: [
    { name: "Nakış", line: "Kumaşın kendi motiflerinden birinin üstüne ya da ayrı bir bant olarak işlenir." },
    { name: "Püskül", line: "Çoğu zaman damgadan sarkar. Rengi parçaya göre seçilir." },
    { name: "Pirinç damga", line: "Parçanın numarasını taşır. Yeri her parçada yeniden seçilir." },
  ],
  en: [
    { name: "Embroidery", line: "Stitched over one of the fabric's own motifs, or as a band of its own." },
    { name: "Tassel", line: "Usually hangs from the seal. Its colour is chosen for the piece." },
    { name: "Brass seal", line: "Carries the piece's number. Its place is chosen anew for every piece." },
  ],
};

/**
 * Üç imza, kartvizitteki gibi küçük kartlar üzerinde. Nesnenin resmi değil, malzemenin yakın çekimi:
 * saten dikiş bandı, ipek saçak, tornada işlenmiş pirinç. (Birebir çizimler çizgi film gibi duruyordu.)
 * Fotoğraf istenmiyor; değiştirilecekse yine soyut kalsın.
 */
export function CraftMarks({ lang }: { lang: Lang }) {
  const items = COPY[lang];
  const art = [<Embroidery key="n" />, <Tassel key="p" />, <Seal key="d" />];
  return (
    <ul className="mt-16 grid gap-6 md:grid-cols-3">
      {items.map((it, i) => (
        <Reveal as="li" key={it.name} delay={i * 0.12}>
          <div className="relative aspect-[85/55] overflow-hidden border border-altin/20 bg-gece">
            {/* Pencereden düşen ışık */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: "radial-gradient(80% 90% at 18% 0%, rgba(240,220,185,0.08), transparent 60%), radial-gradient(60% 60% at 50% 60%, rgba(110,31,36,0.18), transparent 70%)" }}
            />
            <div className="absolute inset-0">{art[i]}</div>
            {/* Kartın boyalı kenarı */}
            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] bg-lal" />
          </div>
          <h3 className="mt-6 font-serif text-[1.75rem] font-light leading-none">
            <span className="nums text-altin">{["I", "II", "III"][i]}.</span> {it.name}
          </h3>
          <p className="mt-3 max-w-[34ch] text-tas">{it.line}</p>
        </Reveal>
      ))}
    </ul>
  );
}

const GOLD = "#b08d57";
const LAL = "#6e1f24";
const BORDO = "#8f2e35";

/** Sabit tohumlu rastgele sayı: sunucu ve tarayıcı aynı çizgileri üretsin (hydration uyuşmazlığı olmasın). */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
const f = (n: number) => Math.round(n * 100) / 100;

/** Kart kutusu 170×110 (kartın 85/55 oranı); svg kartı tam kaplar. */
function Card({ id, children }: { id: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 170 110" className="block h-full w-full" fill="none" strokeLinecap="round" aria-hidden="true">
      <defs>
        {/* userSpaceOnUse: kutu esaslı geçiş tam yatay/dikey çizgilerde hiç çizilmiyor */}
        <linearGradient id={`${id}-g`} gradientUnits="userSpaceOnUse" x1="20" y1="0" x2="150" y2="110">
          <stop offset="0" stopColor="#dcc08a" />
          <stop offset="0.5" stopColor={GOLD} />
          <stop offset="1" stopColor="#86693e" />
        </linearGradient>
      </defs>
      {children}
    </svg>
  );
}

/**
 * Nakış: saten dikiş. Kısa eğik ipler yan yana, hafif kıvrılan bir yaprak gibi uçlara doğru incelir.
 * Üstte ve altta kumaşın dokusu gibi ince, kesik kordon.
 */
const SATIN = (() => {
  const r = rng(23);
  const out: { d: string; o: number }[] = [];
  const x0 = 26, x1 = 144;
  for (let x = x0; x <= x1; x += 1.3) {
    const u = (x - x0) / (x1 - x0);
    const h = 0.8 + 13 * Math.pow(Math.sin(Math.PI * u), 0.75);
    const cy = 55 + 4 * Math.sin(2 * Math.PI * u);
    const lean = 2.2 + 1.2 * Math.sin(Math.PI * u);
    out.push({ d: `M${f(x - lean)} ${f(cy - h)}L${f(x + lean)} ${f(cy + h)}`, o: f(0.45 + r() * 0.5) });
  }
  return out;
})();

function Embroidery() {
  const g = "url(#cm-n-g)";
  return (
    <Card id="cm-n">
      <path d="M18 33H152M18 77H152" stroke={g} strokeWidth="0.45" strokeDasharray="1.4 1.8" opacity="0.4" />
      <g stroke={g} strokeWidth="0.5">
        {SATIN.map((s, i) => (
          <path key={i} d={s.d} opacity={s.o} />
        ))}
      </g>
    </Card>
  );
}

/** Püskül: kartın üstünden dökülen ipek saçak, bordo ve lal; arada birkaç altın tel, üstte altın sargı. */
const THREADS = (() => {
  const r = rng(41);
  const out: { d: string; c: string; w: number; o: number }[] = [];
  const n = 120;
  for (let i = 0; i < n; i++) {
    // Ortada sık, kenarlara doğru seyrek: saçak kendi ağırlığıyla toplanmış gibi
    const t = i / (n - 1) - 0.5;
    const x = 85 + Math.sign(t) * Math.pow(Math.abs(t) * 2, 1.25) * 58 + (r() - 0.5) * 0.9;
    const y = 104 - r() * 22 - Math.abs(t) * 18;
    const gold = r() < 0.07;
    out.push({
      d: `M${f(x)} 0Q${f(x + (r() - 0.5) * 3)} ${f(y / 2)} ${f(x + (r() - 0.5) * 3)} ${f(y)}`,
      c: gold ? GOLD : r() < 0.45 ? BORDO : LAL,
      w: f(gold ? 0.3 : 0.35 + r() * 0.45),
      o: f(gold ? 0.45 + r() * 0.25 : 0.3 + r() * 0.5),
    });
  }
  return out;
})();

function Tassel() {
  return (
    <Card id="cm-p">
      <defs>
        {/* İplik uçları kesik değil, yumuşakça kaybolsun */}
        <linearGradient id="cm-p-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.55" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="cm-p-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="170" height="110">
          <rect width="170" height="110" fill="url(#cm-p-fade)" />
        </mask>
      </defs>
      <g mask="url(#cm-p-mask)">
        {THREADS.map((t, i) => (
          <path key={i} d={t.d} stroke={t.c} strokeWidth={t.w} opacity={t.o} />
        ))}
      </g>
      <path d="M24 12H146M24 13.4H146M24 14.8H146" stroke="url(#cm-p-g)" strokeWidth="0.45" opacity="0.85" />
    </Card>
  );
}

/** Pirinç damga: tornada işlenmiş pirinç gibi ince eş merkezli halkalar, ortada numara. */
const RINGS = (() => {
  const r = rng(11);
  const out: { r: number; o: number }[] = [];
  for (let k = 5; k <= 31; k += 1.15) out.push({ r: f(k), o: f(0.25 + r() * 0.35) });
  return out;
})();

function Seal() {
  const g = "url(#cm-d-g)";
  return (
    <Card id="cm-d">
      <g stroke={g} strokeWidth="0.3">
        {RINGS.map((c) => (
          <circle key={c.r} cx="85" cy="55" r={c.r} opacity={c.o} />
        ))}
      </g>
      <circle cx="85" cy="55" r="33" stroke={g} strokeWidth="1.1" />
      <circle cx="85" cy="55" r="11" fill="#14110f" stroke={g} strokeWidth="0.5" />
      <text x="85" y="58" textAnchor="middle" fill={g} style={{ font: "400 8.5px var(--font-serif)", letterSpacing: "0.08em" }}>
        001
      </text>
    </Card>
  );
}
