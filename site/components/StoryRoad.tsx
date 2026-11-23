"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

/**
 * Hikâye sayfasının yolu: sayfa boyunca inen 1 px altın çizgi.
 * Soluk iz yolun nereye gittiğini baştan gösterir; altın çizgi kaydırdıkça uzar.
 * Duraklar (satırlar) içeriklerini `pl-[calc(var(--road-x)+2rem)]` ile çizginin sağına iter
 * ve işaretlerini `RoadMark` ile koyar.
 */
export function StoryRoad({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 70%"] });
  const scaleY = useTransform(scrollYProgress, (v) => (reduce ? 1 : Math.min(1, Math.max(0, v))));

  return (
    <div
      ref={ref}
      className={`relative [--road-x:24px] lg:[--road-x:calc(var(--gutter)+6vw)] ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 top-0 w-px bg-altin/25"
        style={{ left: "var(--road-x)" }}
      />
      <motion.span
        aria-hidden="true"
        data-road-line=""
        className="pointer-events-none absolute bottom-0 top-0 w-px origin-top bg-altin"
        style={{ left: "var(--road-x)", scaleY }}
      />
      {children}
    </div>
  );
}

// Framer renkleri sayıdan sayıya geçirir; CSS değişkeniyle geçiş yapamaz (globals.css: --color-altin, --color-gece)
const GOLD = "#b08d57";
const NIGHT = "#14110f";

/**
 * Durak işareti: 45° dönmüş kare. Çizginin ucu (ekranın %70 hizası) oraya varınca içi altınla dolar.
 * Kaydırmaya bağlı olduğu için hızlı kaydırmada ya da sayfanın ortasından açılınca atlanan işaret kalmaz.
 */
export function RoadMark({ size = "sm", className = "" }: { size?: "sm" | "lg"; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 70%"] });
  const backgroundColor = useTransform(scrollYProgress, (v) => (reduce || v > 0 ? GOLD : NIGHT));
  const px = size === "lg" ? 13 : 8;
  return (
    <motion.span
      ref={ref}
      aria-hidden="true"
      data-road-mark={size}
      className={`pointer-events-none absolute z-[1] block rotate-45 border border-altin transition-colors duration-500 ${className}`}
      style={{ left: "var(--road-x)", width: px, height: px, marginLeft: -px / 2, backgroundColor }}
    />
  );
}
