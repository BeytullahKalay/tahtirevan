"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

type Orb = { id: string; name: string; href: string; swatch: string; x: number; y: number; size: number; depth: number; mobile?: boolean };

type Props = {
  title: string;
  cta: string;
  ctaHref: string;
  fabric: { id: string; name: string; code: string; motif: string; image: string };
  orbs: Orb[];
  scrollHint: string;
};

const seg = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

/**
 * Açılış sahnesi: karanlıkta başlık ve çevresinde süzülen kumaş daireleri.
 * Aşağı kaydırdıkça daireler açılır, ortadan bir kumaş belirir ve ekranı doldurur.
 * (Eskiden ortada bir koltuk görseli vardı; kullanıcı isteğiyle kaldırıldı.)
 */
export function HeroChair({ title, cta, ctaHref, fabric, orbs, scrollHint }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Tam ekran kumaş, kaydırma oraya yaklaşmadan indirilmez
  const [fabricOn, setFabricOn] = useState(false);
  useMotionValueEvent(p, "change", (v) => {
    if (v > 0.02 && !fabricOn) setFabricOn(true);
  });
  // Açılış görselsiz olduğundan kumaşı sayfa oturunca da önceden indir (kaydırınca boş daire görünmesin)
  useEffect(() => {
    const t = window.setTimeout(() => setFabricOn(true), 2500);
    return () => window.clearTimeout(t);
  }, []);

  // İmleç eğimi (dairelerin derinlik kayması)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 60, damping: 18, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, mx, my]);

  // Kaydırmaya bağlı sahne
  const lens = useTransform(p, [0.18, 0.7], [0, 82]);
  const clip = useMotionTemplate`circle(${lens}% at 50% 46%)`;
  const fabricScale = useTransform(p, [0.18, 1], reduce ? [1.05, 1.05] : [1.5, 1.05]);

  // Opaklıklar fonksiyonla hesaplanır: dizi biçimi tarayıcının kaydırma zaman çizelgesine
  // devredildiğinde aralık dışında yanlış değer veriyor.
  const titleOpacity = useTransform(p, (v) => 1 - seg(v, 0, 0.18));
  const titleY = useTransform(p, [0, 0.18], [0, -70]);
  const nameOpacity = useTransform(p, (v) => seg(v, 0.6, 0.74));
  const nameY = useTransform(p, [0.6, 0.85], [40, 0]);
  const orbSpread = useTransform(p, [0, 0.35], [1, 1.9]);
  const orbOpacity = useTransform(p, (v) => 1 - seg(v, 0.12, 0.32));

  return (
    <section ref={ref} className="relative h-[220svh]" aria-label="Tahtırevan">
      <div className="sticky top-0 h-[100svh] min-h-[560px] overflow-hidden">
        {/* Tek ışık */}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(42% 46% at 50% 46%, rgba(122,30,44,0.30) 0%, transparent 70%), radial-gradient(70% 60% at 50% 30%, rgba(176,141,87,0.10) 0%, transparent 70%), #14110f",
          }}
        />

        {/* Kumaş orbları */}
        {orbs.map((o, i) => (
          <OrbView key={o.id} orb={o} index={i} spread={orbSpread} opacity={orbOpacity} sx={sx} sy={sy} reduce={reduce} />
        ))}

        {/* Kumaşın içine giriş */}
        <motion.div className="absolute inset-0" style={{ clipPath: clip }} aria-hidden="true">
          <motion.div className="absolute inset-0" style={{ scale: fabricScale }}>
            {fabricOn && <Image src={fabric.image} alt="" fill sizes="100vw" className="object-cover" />}
          </motion.div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,17,15,0.85), rgba(20,17,15,0.15) 55%, rgba(20,17,15,0.35))" }} />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-[12svh] px-[var(--gutter)] text-center"
          style={{ opacity: nameOpacity, y: nameY }}
        >
          <p className="label !text-fildisi/80">{fabric.code}</p>
          <p className="display mt-3">{fabric.name}</p>
          <p className="mt-3 text-lg text-fildisi/85">{fabric.motif}</p>
        </motion.div>

        {/* Başlık: ekranın ortasında */}
        <motion.div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-[var(--gutter)] pt-[6svh] text-center"
          style={{ opacity: titleOpacity, y: titleY }}
        >
          <h1 className="display max-w-[14ch] !text-[clamp(2.6rem,min(8vw,11svh),7.5rem)] [text-shadow:0_2px_30px_rgba(10,8,6,0.7)]">
            {title.split(" ").map((w, i) => (
              <Fragment key={i}>
                {/* Boşluk kutunun dışında: inline-block içindeki son boşluk yutuluyordu */}
                {i > 0 && " "}
                <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                  <span className="word-rise inline-block" style={{ ["--d" as string]: `${300 + i * 90}ms` }}>
                    {w}
                  </span>
                </span>
              </Fragment>
            ))}
          </h1>
          <div className="rise" style={{ ["--d" as string]: "900ms" }}>
            <Link href={ctaHref} className="link-gold label tap mt-8 !text-fildisi">
              {cta}
            </Link>
          </div>
        </motion.div>

        <motion.span
          className="label pointer-events-none absolute inset-x-0 bottom-[5svh] z-10 hidden flex-col items-center gap-2 !text-[10px] [@media(min-height:700px)]:flex"
          style={{ opacity: titleOpacity }}
          aria-hidden="true"
        >
          <span className="rise flex flex-col items-center gap-2" style={{ ["--d" as string]: "1600ms" }}>
            {scrollHint}
            <span className="block h-8 w-px origin-top animate-[scroll-hint_2.2s_ease-in-out_infinite] bg-altin/70" />
          </span>
        </motion.span>
      </div>
    </section>
  );
}

function OrbView({
  orb,
  index,
  spread,
  opacity,
  sx,
  sy,
  reduce,
}: {
  orb: Orb;
  index: number;
  spread: MotionValue<number>;
  opacity: MotionValue<number>;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  reduce: boolean;
}) {
  const x = useTransform<number, string>([spread, sx], ([s, m]) => `calc(${orb.x * s}vw + ${reduce ? 0 : m * -60 * orb.depth}px)`);
  const y = useTransform<number, string>([spread, sy], ([s, m]) => `calc(${orb.y * s}svh + ${reduce ? 0 : m * -50 * orb.depth}px)`);
  return (
    <motion.div
      className={`absolute left-1/2 top-[44%] z-[5] ${orb.mobile ? "" : "hidden md:block"}`}
      style={{ x, y, opacity }}
    >
      <div className="orb-enter" style={{ ["--d" as string]: `${500 + index * 120}ms` }}>
        <Link
          href={orb.href}
          className="orb group relative -ml-[50%] -mt-[50%] block"
          style={{ width: `clamp(${orb.size * 0.55}px, ${orb.size / 14}vw, ${orb.size}px)`, animationDelay: `${index * -1.3}s` }}
          aria-label={orb.name}
        >
          <span className="relative block aspect-square overflow-hidden rounded-full outline outline-1 outline-offset-4 outline-altin/30 transition-[outline-color,transform] duration-700 group-hover:scale-110 group-hover:outline-altin">
            <Image src={orb.swatch} alt="" fill unoptimized loading="eager" className="object-cover transition-transform duration-[1.2s] group-hover:scale-125" />
          </span>
          <span className="label absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap !text-[10px] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            {orb.name}
          </span>
        </Link>
      </div>
    </motion.div>
  );
}
