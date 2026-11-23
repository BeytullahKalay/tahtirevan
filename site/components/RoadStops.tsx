"use client";

import Link from "next/link";
import { useId, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export type RoadStop = {
  id: string;
  /** "Durak 01 · Başlangıç" gibi üst satır */
  kicker: string;
  name: string;
  line?: string;
  href: string;
  /** Kemerin içini döşeyen kumaş (şerit görseli) */
  tile?: string;
};

type Props = {
  stops: RoadStop[];
  upcoming: number;
  /** Boş durakların üst satırı için: "Durak" */
  stopWord: string;
  next: string;
  nextLine: string;
  see: string;
};

const seg = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

const ARCH_INSIDE =
  "M58 126V80C58 61 69 53 82 45.5C91 40.3 97 35.5 100 27C103 35.5 109 40.3 118 45.5C131 53 142 61 142 80V126Z";
const BUTA =
  "M-1.5 4C-4.5 4 -5.2 1 -4.6 -1C-4 -3 -1.8 -4.2 0.8 -3.6C2.8 -3.2 4 -2.4 5.6 -3.6C5.2 -1.2 3.6 0.2 2 1.6C1 2.8 0 4 -1.5 4Z";

/**
 * Yol ve duraklar: her durak, amblemdeki tahtırevanın kemeri gibi bir pencere.
 * Yayındaki koleksiyonların kemeri altın varak ve kumaşla döşeli; sıradaki duraklar
 * kâğıda mürekkepsiz kabartılmış gibi boş. Hepsi tek bir altın sırıkla (yolla) bağlı;
 * sırık kaydırdıkça çizilir. Ana sayfada ve Hikâye sayfasında kullanılır.
 */
export function RoadStops({ stops, upcoming, stopWord, next, nextLine, see }: Props) {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 90%", "start 30%"] });
  const draw = useTransform(scrollYProgress, (v) => (reduce ? 1 : seg(v, 0, 1)));
  const total = stops.length + upcoming;
  // Yolun yürünmüş kısmı: son yayındaki durağa kadar altın, sonrası kesik çizgi
  const walked = `${((stops.length - 0.5) / total) * 100}%`;

  return (
    <ol
      ref={ref}
      className="relative mt-20 grid gap-y-14 [--aw:96px] sm:grid-cols-2 sm:gap-x-8 lg:[--aw:150px] lg:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]"
      style={{ ["--n" as string]: total }}
    >
      {/* Sırık: genişte yatay, kemerlerin ayak hizasında */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[calc(var(--aw)*1.5)] hidden h-[3px] lg:block"
      >
        <motion.span className="absolute inset-0 origin-left" style={{ scaleX: draw }}>
          <span className="absolute inset-y-0 left-0 bg-gradient-to-r from-altin/0 via-altin to-altin" style={{ width: walked }} />
          <span
            className="absolute inset-y-[1px] right-0"
            style={{
              left: walked,
              background: "repeating-linear-gradient(90deg, rgba(176,141,87,0.55) 0 10px, transparent 10px 20px)",
              maskImage: "linear-gradient(90deg, #000 0%, #000 60%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(90deg, #000 0%, #000 60%, transparent 100%)",
            }}
          />
        </motion.span>
      </span>

      {stops.map((s) => (
        <li key={s.id} className="relative flex gap-6 lg:block">
          <Arch kind="open" tile={s.tile} />
          <div className="min-w-0 lg:mt-8">
            <p className="label !text-[10px]">{s.kicker}</p>
            <p className="mt-3 font-serif text-3xl font-light leading-none">{s.name}</p>
            {s.line && <p className="mt-3 max-w-[30ch] text-tas">{s.line}</p>}
            <Link href={s.href} className="link-gold is-static label tap mt-5 inline-block !text-fildisi">
              {see}
            </Link>
          </div>
        </li>
      ))}

      {Array.from({ length: upcoming }, (_, k) => (
        <li key={`next-${k}`} className="relative flex gap-6 lg:block" aria-hidden={k > 0 ? true : undefined}>
          <Arch kind="ahead" />
          <div className="min-w-0 lg:mt-8">
            <p className="label !text-[10px] !text-tas/70">
              {stopWord} {String(stops.length + k + 1).padStart(2, "0")}
            </p>
            <p className="mt-3 font-serif text-3xl font-light italic leading-none text-tas">{k === 0 ? next : "·  ·  ·"}</p>
            {k === 0 && <p className="mt-3 max-w-[30ch] text-tas/80">{nextLine}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Tek bir durak kemeri. "open": altın varak + kumaş, "ahead": mürekkepsiz kabartma. */
function Arch({ kind, tile }: { kind: "open" | "ahead"; tile?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const lines = (stroke: string, extra?: { transform?: string }) => (
    <g stroke={stroke} transform={extra?.transform}>
      <path d="M100 4V9" strokeWidth="1.4" />
      <path d="M100 9C103.6 13 104.4 16.6 100 21C95.6 16.6 96.4 13 100 9Z" strokeWidth="1.4" />
      <path d="M95.5 21H104.5M97 24H103" strokeWidth="1.4" />
      <path d="M58 158V80C58 61 69 53 82 45.5C91 40.3 97 35.5 100 27C103 35.5 109 40.3 118 45.5C131 53 142 61 142 80V158" strokeWidth="2.2" />
      <path
        d="M62 92V80C62 76.6 62.6 73.6 63.8 71A5.6 5.6 0 0 1 70.4 64A6 6 0 0 1 78.6 56.4A6 6 0 0 1 87.2 50A5.6 5.6 0 0 1 95 44.4C97.1 42.6 98.8 40.6 100 38.2C101.2 40.6 102.9 42.6 105 44.4A5.6 5.6 0 0 1 112.8 50A6 6 0 0 1 121.4 56.4A6 6 0 0 1 129.6 64A5.6 5.6 0 0 1 136.2 71C137.4 73.6 138 76.6 138 80V92"
        strokeWidth="1.3"
      />
      <path d="M58 126H142M58 145H142" strokeWidth="1.6" />
      <path d="M61 129.4H139M61 141.6H139" strokeWidth="0.7" />
      <g strokeWidth="0.9">
        {[68, 79, 90].map((x) => (
          <path key={x} d={BUTA} transform={`translate(${x} 135.8) scale(0.92)`} />
        ))}
        <path d="M100 131.6L103.9 135.5L100 139.4L96.1 135.5Z" />
        {[110, 121, 132].map((x) => (
          <path key={x} d={BUTA} transform={`translate(${x} 135.8) scale(-0.92 0.92)`} />
        ))}
      </g>
    </g>
  );

  return (
    <svg
      viewBox="50 0 100 162"
      className="block h-auto w-[var(--aw)] shrink-0 overflow-visible"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${uid}f`} gradientUnits="userSpaceOnUse" x1="50" y1="0" x2="150" y2="162">
          <stop offset="0" stopColor="#d6b97f" />
          <stop offset="0.5" stopColor="#b08d57" />
          <stop offset="1" stopColor="#8a6b3e" />
        </linearGradient>
        <clipPath id={`${uid}c`}>
          <path d={ARCH_INSIDE} />
        </clipPath>
        <linearGradient id={`${uid}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14110f" stopOpacity="0.8" />
          <stop offset="0.5" stopColor="#14110f" stopOpacity="0.3" />
          <stop offset="1" stopColor="#14110f" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {kind === "open" ? (
        <>
          <g clipPath={`url(#${uid}c)`}>
            <rect x="58" y="27" width="84" height="99" fill="#1b1714" />
            {tile && <image href={tile} x="56" y="25" width="88" height="103" preserveAspectRatio="xMidYMid slice" />}
            <rect x="58" y="27" width="84" height="99" fill={`url(#${uid}s)`} />
          </g>
          <rect x="58" y="126" width="84" height="19" fill="#14110f" />
          {lines(`url(#${uid}f)`)}
        </>
      ) : (
        <>
          <path d={ARCH_INSIDE} fill="#120f0d" />
          {/* Kabartma: gölge, ışık, kâğıt rengi */}
          {lines("rgba(0,0,0,0.8)", { transform: "translate(0.7 0.8)" })}
          {lines("rgba(255,236,205,0.10)", { transform: "translate(-0.6 -0.6)" })}
          {lines("#2a211b")}
        </>
      )}
    </svg>
  );
}
