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

const BUTA =
  "M-1.5 4C-4.5 4 -5.2 1 -4.6 -1C-4 -3 -1.8 -4.2 0.8 -3.6C2.8 -3.2 4 -2.4 5.6 -3.6C5.2 -1.2 3.6 0.2 2 1.6C1 2.8 0 4 -1.5 4Z";
const BUTA_EYE = "M-1.6 2.2C-3 2.2 -3.2 0.8 -2.8 -0.2C-2.3 -1.4 -0.9 -1.8 0.4 -1.4";

/**
 * Üç imza, kartvizitteki gibi küçük kartlar üzerinde altın çizimlerle.
 * Gerçek nakış/püskül/damga fotoğrafları gelince çizimlerin yerine konabilir.
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
            <div className="absolute inset-0 flex items-center justify-center">{art[i]}</div>
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

function Defs({ id }: { id: string }) {
  return (
    <defs>
      {/* userSpaceOnUse: kutu esaslı geçiş tam yatay/dikey çizgilerde hiç çizilmiyor */}
      <linearGradient id={`${id}-g`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100">
        <stop offset="0" stopColor="#dcc08a" />
        <stop offset="0.5" stopColor={GOLD} />
        <stop offset="1" stopColor="#86693e" />
      </linearGradient>
    </defs>
  );
}

/** Nakış: buta bandı, dikiş izi gibi kesik çizgiyle; sağda iğne ve ipliği. */
function Embroidery() {
  const g = "url(#cm-n-g)";
  return (
    <svg viewBox="0 0 160 100" className="h-[62%] w-auto" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <Defs id="cm-n" />
      <path d="M10 34H128M10 66H128" stroke={g} strokeWidth="1.4" />
      <path d="M10 38H128M10 62H128" stroke={g} strokeWidth="0.6" strokeDasharray="1.6 1.6" />
      <g stroke={g} strokeWidth="0.55" strokeDasharray="1.1 0.8">
        {[22, 42, 62].map((x) => (
          <g key={x} transform={`translate(${x} 50.5) scale(2.1)`}>
            <path d={BUTA} />
            <path d={BUTA_EYE} />
          </g>
        ))}
        {[96, 116].map((x) => (
          <g key={x} transform={`translate(${x} 50.5) scale(-2.1 2.1)`}>
            <path d={BUTA} />
            <path d={BUTA_EYE} />
          </g>
        ))}
        <path d="M79 42L87.5 50.5L79 59L70.5 50.5Z" />
      </g>
      <circle cx="79" cy="50.5" r="1.3" fill={g} />
      {/* iplik ve iğne */}
      <path d="M118 50C126 40 136 44 138 54C140 64 148 66 152 58" stroke="#8f2e35" strokeWidth="1" />
      <path d="M131 26L152 58" stroke={g} strokeWidth="1.3" />
      <ellipse cx="133.2" cy="29.4" rx="0.9" ry="2.4" transform="rotate(-33 133.2 29.4)" stroke={g} strokeWidth="0.6" />
    </svg>
  );
}

/** Püskül: altın düğüm, bordo ipek, altın bilezik. */
function Tassel() {
  return (
    <svg viewBox="0 0 60 100" className="h-[72%] w-auto" fill="none" strokeLinecap="round" aria-hidden="true">
      <Defs id="cm-p" />
      <defs>
        <linearGradient id="cm-silk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4a1418" />
          <stop offset="0.35" stopColor="#8f2e35" />
          <stop offset="0.6" stopColor="#6e1f24" />
          <stop offset="1" stopColor="#3d1013" />
        </linearGradient>
      </defs>
      <path d="M30 2V20" stroke="url(#cm-p-g)" strokeWidth="1.2" />
      <path d="M30 20C25 20 23.5 25 26 28C27 29.2 28.4 30 30 30C31.6 30 33 29.2 34 28C36.5 25 35 20 30 20Z" stroke="url(#cm-p-g)" strokeWidth="1.1" fill="#14110f" />
      <path d="M26.5 31H33.5L35 37H25Z" fill="url(#cm-silk)" />
      <rect x="23.5" y="37" width="13" height="3.4" rx="0.8" fill="url(#cm-p-g)" />
      <path d="M24 40.4C21 56 19.6 74 18.6 96H41.4C40.4 74 39 56 36 40.4Z" fill="url(#cm-silk)" />
      <path d="M25.6 44V95M28.2 44V96M30 44V96M31.8 44V96M34.4 44V95M22.6 56V95M37.4 56V95" stroke="#2c0b0e" strokeOpacity="0.6" strokeWidth="0.5" />
      <path d="M27 44V93M33 44V93" stroke="#c05a62" strokeOpacity="0.35" strokeWidth="0.5" />
    </svg>
  );
}

/** Pirinç damga: çift çerçeveli kare mühür, içinde küçük amblem ve numara. */
function Seal() {
  const g = "url(#cm-d-g)";
  return (
    <svg viewBox="0 0 100 100" className="h-[66%] w-auto" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <Defs id="cm-d" />
      <rect x="8" y="8" width="84" height="84" stroke={g} strokeWidth="2" />
      <rect x="15" y="15" width="70" height="70" stroke={g} strokeWidth="0.8" />
      <g transform="translate(31 18) scale(0.6)" stroke={g}>
        <path d="M32 3.5C34.2 6 34.4 8.2 32 10.6C29.6 8.2 29.8 6 32 3.5Z" fill={g} stroke="none" />
        <path d="M19.5 57V31C19.5 24.6 23.4 21.6 27.6 18.8C30 17.2 31.4 15.4 32 12.8C32.6 15.4 34 17.2 36.4 18.8C40.6 21.6 44.5 24.6 44.5 31V57" strokeWidth="2.4" />
        <path d="M19.5 44H44.5" strokeWidth="1.8" />
        <path d="M10 50.5H54" strokeWidth="2.6" />
      </g>
      <text x="50" y="76" textAnchor="middle" fill={g} style={{ font: "500 8px var(--font-serif)", letterSpacing: "0.18em" }}>
        N° 001
      </text>
    </svg>
  );
}
