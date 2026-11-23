"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

type HeroFabric = { id: string; name: string; tile: string; href: string };

type Props = {
  title: string;
  cta: string;
  ctaHref: string;
  fabrics: HeroFabric[];
  fabricLabel: string;
  scrollHint: string;
};

const seg = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

/** Kemerin içi: koltuğun oturulan yeri. Kumaş buraya giydirilir. */
const ARCH_INSIDE =
  "M58 126V80C58 61 69 53 82 45.5C91 40.3 97 35.5 100 27C103 35.5 109 40.3 118 45.5C131 53 142 61 142 80V126Z";

const BUTA =
  "M-1.5 4C-4.5 4 -5.2 1 -4.6 -1C-4 -3 -1.8 -4.2 0.8 -3.6C2.8 -3.2 4 -2.4 5.6 -3.6C5.2 -1.2 3.6 0.2 2 1.6C1 2.8 0 4 -1.5 4Z";
const BUTA_EYE = "M-1.6 2.2C-3 2.2 -3.2 0.8 -2.8 -0.2C-2.3 -1.4 -0.9 -1.8 0.4 -1.4";

/**
 * Açılış, kartvizitin diliyle: karanlık keçe kâğıt, pencereden düşen ışık, altın varak amblem.
 * Amblemdeki tahtırevanın içi panelde seçilen kumaşlarla döşenir ve sırayla değişir.
 * Kartın üç imzası da burada: sağda kabartma buta bandı (nakış), aşağıda sallanan püskül,
 * sağ altta pirinç damga. Alttaki bordo çizgi kartın boyalı kenarı.
 * (Önceki açılış, kumaş daireleri: HeroChair.tsx.)
 */
export function HeroCard({ title, cta, ctaHref, fabrics, fabricLabel, scrollHint }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Opaklık fonksiyon biçimiyle (dizi biçimi kaydırma zaman çizelgesinde yanlış değer veriyor)
  const fade = useTransform(p, (v) => 1 - seg(v, 0, 0.45));
  const lift = useTransform(p, (v) => (reduce ? 0 : v * -110));
  const grow = useTransform(p, (v) => (reduce ? 1 : 1 + seg(v, 0, 0.6) * 0.06));

  // Kumaşlar sırayla: yalnızca açılış ekrandayken ve sekme açıkken döner
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(1); // kaç kumaşın görseli yüklendi (sıradakini önceden al)
  useEffect(() => {
    if (reduce || fabrics.length < 2 || !ref.current) return;
    let timer: number | undefined;
    const start = () => {
      if (timer !== undefined) return;
      timer = window.setInterval(() => {
        if (document.visibilityState !== "visible") return;
        setActive((a) => (a + 1) % fabrics.length);
      }, 6000);
    };
    const stop = () => {
      window.clearInterval(timer);
      timer = undefined;
    };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.35 });
    io.observe(ref.current);
    return () => {
      io.disconnect();
      stop();
    };
  }, [reduce, fabrics.length]);
  useEffect(() => {
    setShown((s) => Math.max(s, Math.min(fabrics.length, active + 2)));
  }, [active, fabrics.length]);

  const current = fabrics[active];

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[600px] overflow-hidden bg-gece" aria-label="Tahtırevan">
      <Atmosphere />
      <EmbossedBand />

      {/* Amblem, ad, başlık */}
      <motion.div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center px-[var(--gutter)] pt-[7svh] text-center"
        style={{ opacity: fade, y: lift }}
      >
        <motion.div className="relative" style={{ scale: grow }}>
          {/* Yere düşen yumuşak gölge (drop-shadow değil: her karede yeniden çizilir) */}
          <span
            aria-hidden="true"
            className="hero-fade absolute bottom-[-4%] left-1/2 h-[12%] w-[86%] -translate-x-1/2 rounded-[50%]"
            style={{ background: "radial-gradient(closest-side, rgba(0,0,0,0.85), transparent)", ["--d" as string]: "600ms" }}
          />
          <Emblem fabrics={fabrics.slice(0, shown)} active={active} reduce={reduce} />
        </motion.div>

        <p
          className="rise mt-[clamp(1.25rem,3.4svh,2.25rem)] mr-[-0.55em] font-serif text-[clamp(1.05rem,1.9vw,1.75rem)] font-normal uppercase leading-none tracking-[0.55em] text-fildisi"
          style={{ ["--d" as string]: "900ms" }}
          aria-hidden="true"
        >
          Tahtırevan
        </p>

        <h1 className="mt-[clamp(0.9rem,2.4svh,1.5rem)] font-serif text-[clamp(1.2rem,2vw,1.85rem)] font-light italic leading-snug text-fildisi/80">
          {title.split(" ").map((w, i) => (
            <Fragment key={i}>
              {i > 0 && " "}
              <span className="inline-block overflow-hidden pb-[0.1em] align-bottom">
                <span className="word-rise inline-block" style={{ ["--d" as string]: `${1150 + i * 70}ms` }}>
                  {w}
                </span>
              </span>
            </Fragment>
          ))}
        </h1>

        <div className="rise" style={{ ["--d" as string]: "1600ms" }}>
          <Link href={ctaHref} className="link-gold is-static label tap mt-[clamp(1rem,3svh,2rem)] !text-altin">
            {cta}
          </Link>
        </div>
      </motion.div>

      {/* Sol alt: amblemin içindeki kumaş */}
      {current && (
        <motion.div
          className="absolute bottom-[calc(5svh+6px)] left-[var(--gutter)] z-20"
          style={{ opacity: fade }}
        >
          <div className="rise" style={{ ["--d" as string]: "1900ms" }}>
            <Link href={current.href} className="link-gold label tap !text-[10px]">
              {fabricLabel} · <span className="text-fildisi">{current.name}</span>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Sağ alt: pirinç damga */}
      <motion.div
        className="pointer-events-none absolute bottom-[calc(5svh+6px)] right-[var(--gutter)] z-20 md:right-[calc(var(--gutter)+64px)]"
        style={{ opacity: fade }}
        aria-hidden="true"
      >
        <div className="rise" style={{ ["--d" as string]: "2000ms" }}>
          <BrassSeal />
        </div>
      </motion.div>

      {/* Alt orta: püsküllü kaydırma işareti */}
      <motion.div
        className="pointer-events-none hero-hint absolute inset-x-0 bottom-[3svh] z-20 flex-col items-center"
        style={{ opacity: fade }}
        aria-hidden="true"
      >
        <div className="rise flex flex-col items-center gap-2" style={{ ["--d" as string]: "2200ms" }}>
          <span className="label !text-[10px]">{scrollHint}</span>
          <Tassel />
        </div>
      </motion.div>

      {/* Kartın boyalı kenarı */}
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 z-20 h-[3px] bg-lal" />
    </section>
  );
}

/** Pencereden düşen ışık, keçe kâğıt dokusu, ortada sıcak bir parıltı. Hepsi durağan. */
function Atmosphere() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(38% 42% at 50% 50%, rgba(110,31,36,0.28) 0%, transparent 70%), radial-gradient(60% 55% at 22% 8%, rgba(233,210,170,0.10) 0%, transparent 70%)",
        }}
      />
      {/* Işık çubukları: sol üstten, pencere pervazından geçmiş gibi */}
      <div className="hero-fade absolute -left-[20%] -top-[30%] h-[160%] w-[95%] origin-top-left rotate-[-32deg]" style={{ ["--d" as string]: "300ms" }}>
        {[
          { left: "18%", w: "9%", a: 0.07 },
          { left: "31%", w: "5%", a: 0.05 },
          { left: "40%", w: "12%", a: 0.06 },
          { left: "57%", w: "4%", a: 0.035 },
        ].map((b, i) => (
          <span
            key={i}
            className="absolute inset-y-0"
            style={{
              left: b.left,
              width: b.w,
              background: `linear-gradient(90deg, transparent, rgba(240,220,185,${b.a}) 35%, rgba(240,220,185,${b.a}) 65%, transparent)`,
              maskImage: "linear-gradient(180deg, transparent 0%, #000 25%, #000 55%, transparent 90%)",
              WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 25%, #000 55%, transparent 90%)",
            }}
          />
        ))}
      </div>
      {/* Keçe kâğıt dokusu */}
      <div className="felt absolute inset-0" />
      {/* Kenarlarda kararma */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(8,6,5,0.65) 100%)" }} />
    </div>
  );
}

/** Altın varak amblem. Kemerin içi kumaşla döşeli; kumaşlar sırayla yumuşakça değişir. */
function Emblem({ fabrics, active, reduce }: { fabrics: HeroFabric[]; active: number; reduce: boolean }) {
  return (
    <svg
      viewBox="0 0 200 164"
      className="emblem relative block h-auto w-[min(80vw,calc(40svh*200/164),460px)] overflow-visible"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Tahtırevan amblemi"
    >
      <defs>
        {/* Varak: durgun altın, üzerinden ara ara bir parıltı geçer */}
        <linearGradient id="hc-foil" gradientUnits="userSpaceOnUse" x1="-70" y1="-30" x2="40" y2="60">
          <stop offset="0" stopColor="#a3804c" />
          <stop offset="0.42" stopColor="#b8945c" />
          <stop offset="0.5" stopColor="#f3e2b8" />
          <stop offset="0.58" stopColor="#b8945c" />
          <stop offset="1" stopColor="#9c7a47" />
          {!reduce && (
            <animateTransform
              attributeName="gradientTransform"
              type="translate"
              values="-60 -40; 300 200; 300 200"
              keyTimes="0; 0.3; 1"
              dur="9s"
              begin="2.6s"
              repeatCount="indefinite"
            />
          )}
        </linearGradient>
        <clipPath id="hc-arch">
          <path d={ARCH_INSIDE} />
        </clipPath>
        <linearGradient id="hc-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14110f" stopOpacity="0.82" />
          <stop offset="0.45" stopColor="#14110f" stopOpacity="0.35" />
          <stop offset="1" stopColor="#14110f" stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id="hc-light" cx="0.3" cy="0.25" r="0.8">
          <stop offset="0" stopColor="#f0dcb4" stopOpacity="0.16" />
          <stop offset="1" stopColor="#f0dcb4" stopOpacity="0" />
        </radialGradient>
        <g id="hc-b">
          <path d={BUTA} />
          <path d={BUTA_EYE} />
        </g>
      </defs>

      {/* Kemerin içi: kumaş + gölge */}
      <g clipPath="url(#hc-arch)" className="hero-fade" style={{ ["--d" as string]: "1000ms" }}>
        <rect x="58" y="27" width="84" height="99" fill="#1b1714" />
        {fabrics.map((f, i) => (
          <image
            key={f.id}
            href={f.tile}
            x="56"
            y="25"
            width="88"
            height="103"
            preserveAspectRatio="xMidYMid slice"
            className="transition-opacity duration-[1800ms] ease-[var(--ease)]"
            style={{ opacity: i === active ? 1 : 0 }}
          />
        ))}
        <rect x="58" y="27" width="84" height="99" fill="url(#hc-shade)" />
        <rect x="58" y="27" width="84" height="99" fill="url(#hc-light)" />
      </g>
      {/* Gövde bandının içi koyu kalsın (kumaş yalnız kemerde) */}
      <rect x="58" y="126" width="84" height="19" fill="#14110f" className="hero-fade" style={{ ["--d" as string]: "700ms" }} />

      <g stroke="url(#hc-foil)">
        {/* tepelik */}
        <path pathLength={1} className="draw" style={{ ["--d" as string]: "200ms" }} d="M100 2.5V8.5" strokeWidth="1.4" />
        <path pathLength={1} className="draw" style={{ ["--d" as string]: "250ms" }} d="M100 8.5C103.6 12.6 104.4 16.4 100 21C95.6 16.4 96.4 12.6 100 8.5Z" strokeWidth="1.4" />
        <path pathLength={1} className="draw" style={{ ["--d" as string]: "300ms" }} d="M95.5 21H104.5M97 24H103" strokeWidth="1.4" />
        {/* kemer ve ayaklar */}
        <path pathLength={1} className="draw" style={{ ["--d" as string]: "200ms" }} d="M58 158V80C58 61 69 53 82 45.5C91 40.3 97 35.5 100 27C103 35.5 109 40.3 118 45.5C131 53 142 61 142 80V158" strokeWidth="2.2" />
        {/* dilimli saçak */}
        <path pathLength={1} className="draw" style={{ ["--d" as string]: "500ms" }} d="M62 92V80C62 76.6 62.6 73.6 63.8 71A5.6 5.6 0 0 1 70.4 64A6 6 0 0 1 78.6 56.4A6 6 0 0 1 87.2 50A5.6 5.6 0 0 1 95 44.4C97.1 42.6 98.8 40.6 100 38.2C101.2 40.6 102.9 42.6 105 44.4A5.6 5.6 0 0 1 112.8 50A6 6 0 0 1 121.4 56.4A6 6 0 0 1 129.6 64A5.6 5.6 0 0 1 136.2 71C137.4 73.6 138 76.6 138 80V92" strokeWidth="1.3" />
        {/* püskül */}
        <g className="hero-fade" style={{ ["--d" as string]: "1300ms" }} strokeWidth="1.1">
          <path d="M100 38.2V47" />
          <circle cx="100" cy="49" r="2" />
          <path d="M98 51.2H102L104.2 63H95.8Z" fill="#14110f" fillOpacity="0.7" />
          <path d="M98.6 54.5V61.8M100 54.5V61.8M101.4 54.5V61.8" strokeWidth="0.7" />
        </g>
        {/* gövde bandı */}
        <path pathLength={1} className="draw" style={{ ["--d" as string]: "700ms" }} d="M58 126H142M58 145H142" strokeWidth="1.6" />
        <path pathLength={1} className="draw" style={{ ["--d" as string]: "800ms" }} d="M61 129.4H139M61 141.6H139" strokeWidth="0.7" />
        {/* buta dizisi */}
        <g className="hero-fade" style={{ ["--d" as string]: "1200ms" }} strokeWidth="0.9">
          <use href="#hc-b" transform="translate(68 135.8) scale(0.92)" />
          <use href="#hc-b" transform="translate(79 135.8) scale(0.92)" />
          <use href="#hc-b" transform="translate(90 135.8) scale(0.92)" />
          <path d="M100 131.6L103.9 135.5L100 139.4L96.1 135.5Z" />
          <use href="#hc-b" transform="translate(110 135.8) scale(-0.92 0.92)" />
          <use href="#hc-b" transform="translate(121 135.8) scale(-0.92 0.92)" />
          <use href="#hc-b" transform="translate(132 135.8) scale(-0.92 0.92)" />
        </g>
        {/* taşıma sırığı */}
        <path pathLength={1} className="draw" style={{ ["--d" as string]: "350ms" }} d="M22 150H178" strokeWidth="3" />
        <g className="hero-fade" style={{ ["--d" as string]: "1100ms" }}>
          <path d="M19 145.6V154.4M181 145.6V154.4" strokeWidth="2.2" />
          <circle cx="12.5" cy="150" r="4.2" strokeWidth="1.6" />
          <circle cx="187.5" cy="150" r="4.2" strokeWidth="1.6" />
        </g>
      </g>
      <g fill="url(#hc-foil)" className="hero-fade" style={{ ["--d" as string]: "1100ms" }}>
        <path d="M100 12.8C101.4 14.6 101.5 16.2 100 17.8C98.5 16.2 98.6 14.6 100 12.8Z" />
        <circle cx="100" cy="135.5" r="0.9" />
        <circle cx="5.4" cy="150" r="1.4" />
        <circle cx="194.6" cy="150" r="1.4" />
      </g>
    </svg>
  );
}

/** Sağ kenarda kabartma buta bandı: mürekkepsiz, ışık ve gölgeyle okunur (kartın arkasındaki gibi). */
function EmbossedBand() {
  const motif = (stroke: string) => (
    <>
      <path d="M2 0V26M42 0V26" stroke={stroke} strokeWidth="1" />
      <path d="M6 0V26M38 0V26" stroke={stroke} strokeWidth="0.6" />
      <g transform="translate(22 8) rotate(90) scale(1.9)" stroke={stroke} strokeWidth="0.55" fill="none">
        <path d={BUTA} />
        <path d={BUTA_EYE} />
      </g>
      <path d="M22 18.5L24.5 21L22 23.5L19.5 21Z" stroke={stroke} strokeWidth="0.7" fill="none" />
    </>
  );
  return (
    <div
      aria-hidden="true"
      className="hero-fade pointer-events-none absolute bottom-0 right-[var(--gutter)] top-[96px] z-[5] hidden w-[44px] md:block"
      style={{
        ["--d" as string]: "700ms",
        maskImage: "linear-gradient(180deg, transparent 0%, #000 18%, #000 82%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 18%, #000 82%, transparent 100%)",
      }}
    >
      <svg width="44" height="100%" className="block h-full" fill="none" strokeLinecap="round">
        <defs>
          <pattern id="hc-band-hi" width="44" height="26" patternUnits="userSpaceOnUse">
            {motif("rgba(255,236,205,0.11)")}
          </pattern>
          <pattern id="hc-band-lo" width="44" height="26" patternUnits="userSpaceOnUse">
            {motif("rgba(0,0,0,0.75)")}
          </pattern>
          <pattern id="hc-band-mid" width="44" height="26" patternUnits="userSpaceOnUse">
            {motif("rgba(42,33,27,0.9)")}
          </pattern>
        </defs>
        <rect x="-1" y="-1" width="46" height="100%" fill="url(#hc-band-lo)" transform="translate(0.8 0.9)" />
        <rect x="-1" y="-1" width="46" height="100%" fill="url(#hc-band-hi)" transform="translate(-0.7 -0.7)" />
        <rect x="-1" y="-1" width="46" height="100%" fill="url(#hc-band-mid)" />
      </svg>
    </div>
  );
}

/** Kartın köşesindeki küçük varak mühür: pirinç damga. */
function BrassSeal() {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id="hc-brass" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="38" y2="38">
          <stop offset="0" stopColor="#d9bd86" />
          <stop offset="0.5" stopColor="#b08d57" />
          <stop offset="1" stopColor="#80653c" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="36" height="36" stroke="url(#hc-brass)" strokeWidth="1.2" />
      <rect x="4.5" y="4.5" width="29" height="29" stroke="url(#hc-brass)" strokeWidth="0.6" />
      <g transform="translate(7 6.5) scale(0.375)" stroke="url(#hc-brass)">
        <path d="M32 3.5C34.2 6 34.4 8.2 32 10.6C29.6 8.2 29.8 6 32 3.5Z" fill="#b08d57" stroke="none" />
        <path d="M19.5 57V31C19.5 24.6 23.4 21.6 27.6 18.8C30 17.2 31.4 15.4 32 12.8C32.6 15.4 34 17.2 36.4 18.8C40.6 21.6 44.5 24.6 44.5 31V57" strokeWidth="2.6" />
        <path d="M19.5 44H44.5" strokeWidth="2" />
        <path d="M10 50.5H54" strokeWidth="2.8" />
      </g>
    </svg>
  );
}

/** Bordo ipek püskül: kaydırma işaretinin ucunda hafifçe sallanır. */
function Tassel() {
  return (
    <svg width="22" height="78" viewBox="0 0 22 78" className="tassel-sway" fill="none">
      <defs>
        <linearGradient id="hc-silk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4a1418" />
          <stop offset="0.35" stopColor="#8f2e35" />
          <stop offset="0.6" stopColor="#6e1f24" />
          <stop offset="1" stopColor="#3d1013" />
        </linearGradient>
        <radialGradient id="hc-knot" cx="0.35" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#ecd3a0" />
          <stop offset="1" stopColor="#8a6a3c" />
        </radialGradient>
      </defs>
      <path d="M11 0V27" stroke="#b08d57" strokeOpacity="0.75" strokeWidth="1" />
      <circle cx="11" cy="30.5" r="3.6" fill="url(#hc-knot)" />
      <path d="M8.2 34h5.6l0.9 5.2H7.3z" fill="url(#hc-silk)" />
      <rect x="7" y="39" width="8" height="1.8" rx="0.4" fill="#b08d57" />
      <path d="M7.2 40.8C5.6 52 4.6 63 3.6 76.5h14.8C17.4 63 16.4 52 14.8 40.8z" fill="url(#hc-silk)" />
      <path d="M8.4 43V75.5M10 43V76M11.6 43V76M13.2 43V75.5M6.8 50V75M15.2 50V75" stroke="#2c0b0e" strokeOpacity="0.55" strokeWidth="0.45" />
      <path d="M9.2 43V74M12.4 43V74" stroke="#b3474f" strokeOpacity="0.35" strokeWidth="0.4" />
    </svg>
  );
}
