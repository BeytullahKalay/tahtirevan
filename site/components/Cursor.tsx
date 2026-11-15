"use client";

import { useEffect, useRef } from "react";

/** Masaüstünde görsellerin üzerinde "Keşfet" yazan küçük dairesel imleç. */
export function Cursor({ label }: { label: string }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches || !el.current) return;

    const node = el.current;
    let x = -200, y = -200, tx = -200, ty = -200;
    let raf: number | null = null;
    let on = false;

    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      node.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${on ? 1 : 0.6})`;
      if (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3) raf = requestAnimationFrame(loop);
      else raf = null;
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const target = (e.target as HTMLElement | null)?.closest?.('[data-cursor="explore"]');
      const next = !!target;
      if (next !== on) {
        on = next;
        node.classList.toggle("on", on);
      }
      if (raf === null) raf = requestAnimationFrame(loop);
    };
    const onLeave = () => {
      on = false;
      node.classList.remove("on");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={el} className="cursor" aria-hidden="true">
      {label}
    </div>
  );
}
