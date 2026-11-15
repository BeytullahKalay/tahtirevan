"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";

type Item = { id: string; name: string; code: string; href: string; tile: string };

const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

/** İki sıra sonsuz kumaş şeridi: kaydırma hızına göre hızlanır, yön değiştirir ve hafifçe eğilir. */
export function FabricMarquee({ items, label }: { items: Item[]; label: string }) {
  const ref = useRef<HTMLElement>(null);
  // Ekranda değilken her kare çalışan döngüyü durdur
  const active = useInView(ref, { margin: "200px 0px" });
  return (
    <section ref={ref} className="overflow-hidden py-[10vh]" aria-label={label}>
      <Row items={items} base={-2.2} active={active} />
      <Row items={[...items].reverse()} base={2.2} active={active} small />
    </section>
  );
}

function Row({ items, base, small, active }: { items: Item[]; base: number; small?: boolean; active: boolean }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const v = useVelocity(scrollY);
  const smooth = useSpring(v, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [-1500, 0, 1500], [-5, 0, 5], { clamp: false });
  const skew = useTransform(smooth, [-2000, 0, 2000], [6, 0, -6]);
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce || !active) return;
    let move = dir.current * base * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * Math.abs(f);
    x.set(wrap(-50, 0, x.get() + move));
  });

  const xp = useTransform(x, (val) => `${val}%`);
  const list = [...items, ...items];

  return (
    <motion.div className="marquee-track gap-5 py-3 md:gap-8" style={{ x: xp, skewX: skew }}>
      {list.map((it, i) => (
        <Link
          key={`${it.id}-${i}`}
          href={it.href}
          className="group relative block shrink-0"
          aria-hidden={i >= items.length ? true : undefined}
          tabIndex={i >= items.length ? -1 : undefined}
          data-cursor="explore"
        >
          <span
            className={`relative block overflow-hidden ${small ? "h-[22vh] w-[17vh] md:h-[26vh] md:w-[20vh]" : "h-[34vh] w-[26vh] md:h-[42vh] md:w-[32vh]"}`}
          >
            <Image
              src={it.tile}
              alt={i >= items.length ? "" : it.name}
              fill
              unoptimized
              loading="eager"
              fetchPriority="low"
              className="object-cover transition-transform duration-[1.4s] ease-[var(--ease)] group-hover:scale-110"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-gece/85 via-gece/0 to-gece/0 opacity-80 transition-opacity duration-700 group-hover:opacity-100" />
            <span className="absolute inset-x-4 bottom-4 flex items-baseline justify-between gap-3">
              <span className={`font-serif font-light leading-none ${small ? "text-xl" : "text-3xl"}`}>{it.name}</span>
              <span className="label !text-[9px] !text-fildisi/70">{it.code}</span>
            </span>
          </span>
        </Link>
      ))}
    </motion.div>
  );
}
