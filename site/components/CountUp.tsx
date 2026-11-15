"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/** Görünür olunca sıfırdan hedef sayıya akar. */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const target = Number(value);
  const [shown, setShown] = useState(Number.isFinite(target) ? "0" : value);

  useEffect(() => {
    if (!inView || !Number.isFinite(target)) return;
    if (reduce) {
      setShown(value);
      return;
    }
    const c = animate(0, target, {
      duration: Math.min(2.4, 0.8 + target / 300),
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setShown(String(Math.round(v))),
    });
    return () => c.stop();
  }, [inView, target, value, reduce]);

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
