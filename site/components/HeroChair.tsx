"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
import { CHAIR } from "@/lib/media";

type Orb = { id: string; name: string; href: string; swatch: string; x: number; y: number; size: number; depth: number; mobile?: boolean };

type Props = {
  title: string;
  cta: string;
  ctaHref: string;
  chairAlt: string;
  fabric: { id: string; name: string; code: string; motif: string; image: string };
  orbs: Orb[];
  scrollHint: string;
};

const seg = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

/**
 * Açılış sahnesi: koltuk karanlıktan döne döne gelir, imleçle eğilir.
 * Aşağı kaydırdıkça döner, sırtındaki kumaşa yaklaşır ve kumaşın içine girer.
 */
export function HeroChair({ title, cta, ctaHref, chairAlt, fabric, orbs, scrollHint }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Tam ekran kumaş, kaydırma oraya yaklaşmadan indirilmez (açılıştaki koltukla yarışmasın)
  const [fabricOn, setFabricOn] = useState(false);
  useMotionValueEvent(p, "change", (v) => {
    if (v > 0.2 && !fabricOn) setFabricOn(true);
  });

  // İmleç eğimi
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
  const turn = useTransform(p, [0, 0.55], [-12, 22]);
  const rotateY = useTransform<number, number>([turn, sx], ([a, b]) => (reduce ? 0 : a + b * 18));
  const rotateX = useTransform(sy, (v) => (reduce ? 0 : -v * 9));
  const scale = useTransform(p, [0, 0.3, 0.72], reduce ? [1, 1, 1] : [1, 1.12, 3.4]);
  const lift = useTransform(p, [0, 0.72], reduce ? ["0%", "0%"] : ["0%", "34%"]);
  // Opaklıklar fonksiyonla hesaplanır: dizi biçimi tarayıcının kaydırma zaman çizelgesine
  // devredildiğinde aralık dışında yanlış değer veriyor.
  const chairOpacity = useTransform(p, (v) => 1 - seg(v, 0.6, 0.76));
  const shadowOpacity = useTransform(p, (v) => 1 - seg(v, 0, 0.3));

  const lens = useTransform(p, [0.42, 0.78], [0, 82]);
  const clip = useMotionTemplate`circle(${lens}% at 50% 42%)`;
  const fabricScale = useTransform(p, [0.42, 1], [1.5, 1.05]);

  const titleOpacity = useTransform(p, (v) => 1 - seg(v, 0, 0.16));
  const titleY = useTransform(p, [0, 0.16], [0, -70]);
  const nameOpacity = useTransform(p, (v) => seg(v, 0.66, 0.78));
  const nameY = useTransform(p, [0.66, 0.85], [40, 0]);
  const orbSpread = useTransform(p, [0, 0.35], [1, 1.9]);
  const orbOpacity = useTransform(p, (v) => 1 - seg(v, 0.12, 0.32));

  return (
    <section ref={ref} className="relative h-[240svh]" aria-label="Tahtırevan">
      <div className="sticky top-0 h-[100svh] min-h-[560px] overflow-hidden">
        {/* Tek ışık */}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(42% 46% at 50% 44%, rgba(122,30,44,0.30) 0%, transparent 70%), radial-gradient(70% 60% at 50% 30%, rgba(176,141,87,0.10) 0%, transparent 70%), #14110f",
          }}
        />

        {/* Kumaş orbları */}
        {orbs.map((o, i) => (
          <OrbView key={o.id} orb={o} index={i} spread={orbSpread} opacity={orbOpacity} sx={sx} sy={sy} reduce={reduce} />
        ))}

        {/* Koltuk */}
        <div className="absolute inset-x-0 bottom-[29svh] top-[10svh] flex items-center justify-center [perspective:1600px]">
          <motion.div
            className="relative aspect-[1009/1128] max-h-full w-[min(90vw,62svh)]"
            style={{ rotateY, rotateX, scale, y: lift, opacity: chairOpacity, transformOrigin: "52% 24%", transformStyle: "preserve-3d" }}
          >
            {/* Giriş animasyonu CSS ile: JavaScript yüklenmeden oynar */}
            <div className="hero-enter absolute inset-0">
              <Image
                src={CHAIR.src}
                alt={chairAlt}
                fill
                priority
                sizes="(min-width: 768px) 60vw, 94vw"
                className="object-contain"
              />
            </div>
          </motion.div>
          <motion.div
            className="absolute -bottom-[1svh] left-1/2 h-[5svh] w-[min(60vw,46svh)] -translate-x-1/2 rounded-[50%] bg-black/70 blur-2xl"
            style={{ opacity: shadowOpacity }}
            aria-hidden="true"
          />
        </div>

        {/* Koltuk görseli yapay zekâ ile üretildi: başlığa binmesin diye telefonda üstte, genişte sol altta */}
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

        {/* Başlık */}
        <motion.div
          className="absolute inset-x-0 bottom-[5svh] z-10 flex flex-col items-center px-[var(--gutter)] text-center"
          style={{ opacity: titleOpacity, y: titleY }}
        >
          <h1 className="display max-w-[14ch] !text-[clamp(2.6rem,min(7vw,9svh),6.5rem)] [text-shadow:0_2px_30px_rgba(10,8,6,0.7)]">
            {title.split(" ").map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <span className="word-rise inline-block" style={{ ["--d" as string]: `${900 + i * 90}ms` }}>
                  {w}
                  {i < title.split(" ").length - 1 ? " " : ""}
                </span>
              </span>
            ))}
          </h1>
          <div className="rise" style={{ ["--d" as string]: "1500ms" }}>
            <Link href={ctaHref} className="link-gold label tap mt-5 !text-fildisi">
              {cta}
            </Link>
          </div>
          <span
            className="rise label mt-5 hidden flex-col items-center gap-2 !text-[10px] [@media(min-height:700px)]:flex"
            style={{ ["--d" as string]: "2200ms" }}
            aria-hidden="true"
          >
            {scrollHint}
            <span className="block h-8 w-px origin-top animate-[scroll-hint_2.2s_ease-in-out_infinite] bg-altin/70" />
          </span>
        </motion.div>
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
      <div className="orb-enter" style={{ ["--d" as string]: `${1100 + index * 120}ms` }}>
        <Link
          href={orb.href}
          className="orb group relative -ml-[50%] -mt-[50%] block"
          style={{ width: `clamp(${orb.size * 0.55}px, ${orb.size / 14}vw, ${orb.size}px)`, animationDelay: `${index * -1.3}s` }}
          aria-label={orb.name}
        >
          <span className="relative block aspect-square overflow-hidden rounded-full outline outline-1 outline-offset-4 outline-altin/30 transition-[outline-color,transform] duration-700 group-hover:scale-110 group-hover:outline-altin">
            <Image src={orb.swatch} alt="" fill unoptimized className="object-cover transition-transform duration-[1.2s] group-hover:scale-125" />
          </span>
          <span className="label absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap !text-[10px] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            {orb.name}
          </span>
        </Link>
      </div>
    </motion.div>
  );
}
