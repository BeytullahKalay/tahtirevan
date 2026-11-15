"use client";

import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";

const C = 2 * Math.PI * 90;
const HOLD_MS = 1600;
const RELEASE_MS = 900;

const COPY = {
  tr: {
    hint: "Mührü basmak için basılı tutun",
    aria: "Mührü basılı tutun",
    done: "Mühürlendi",
    lines: [
      ["Numara", "N° 001"],
      ["Usta imzası", "Gövdenin altında, ahşabın üzerinde"],
      ["Sertifika", "Parçayla birlikte teslim edilir"],
    ],
  },
  en: {
    hint: "Press and hold to set the seal",
    aria: "Press and hold the seal",
    done: "Sealed",
    lines: [
      ["Number", "N° 001"],
      ["Master's signature", "Beneath the frame, in the wood itself"],
      ["Certificate", "Delivered with the piece"],
    ],
  },
};

/**
 * Sitenin tek etkileşim anı: her parçanın numaralanıp imzalanması.
 * Basılı tuttukça altın halka dolar; erken bırakılırsa yavaşça geri çekilir.
 * Tamamlanınca mum mühür lal rengine döner ve sertifika satırları sırayla gelir.
 */
export function SealHold({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const ring = useRef<SVGCircleElement>(null);
  const holding = useRef(false);
  const progress = useRef(0);
  const raf = useRef<number | null>(null);
  const last = useRef(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      progress.current = 1;
      setDone(true);
    }
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, []);

  useEffect(() => {
    if (ring.current) ring.current.style.strokeDashoffset = String(C * (1 - progress.current));
  }, [done]);

  const tick = (now: number) => {
    const dt = Math.min(64, now - last.current);
    last.current = now;
    const p = progress.current + (holding.current ? dt / HOLD_MS : -dt / RELEASE_MS);
    progress.current = Math.max(0, Math.min(1, p));
    // yumuşak eğri: ease-out
    const eased = 1 - Math.pow(1 - progress.current, 2.2);
    if (ring.current) ring.current.style.strokeDashoffset = String(C * (1 - eased));
    if (progress.current >= 1) {
      raf.current = null;
      holding.current = false;
      setDone(true);
      return;
    }
    if (progress.current <= 0 && !holding.current) {
      raf.current = null;
      return;
    }
    raf.current = requestAnimationFrame(tick);
  };

  const start = () => {
    if (done) return;
    holding.current = true;
    if (raf.current === null) {
      last.current = performance.now();
      raf.current = requestAnimationFrame(tick);
    }
  };
  const stop = () => {
    holding.current = false;
  };

  return (
    <div className="flex flex-col items-center gap-10 md:flex-row md:items-center md:gap-16">
      <button
        type="button"
        aria-label={t.aria}
        aria-pressed={done}
        aria-describedby="seal-hint"
        className="relative h-[200px] w-[200px] shrink-0 touch-none select-none rounded-full"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          start();
        }}
        onPointerUp={stop}
        onPointerCancel={stop}
        onLostPointerCapture={stop}
        onKeyDown={(e) => {
          if ((e.key === " " || e.key === "Enter") && !e.repeat) {
            e.preventDefault();
            start();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === " " || e.key === "Enter") stop();
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(154,143,128,0.35)" strokeWidth="1" />
          <circle
            ref={ring}
            className="seal-ring"
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#B08D57"
            strokeWidth="1"
            strokeDasharray={C}
            strokeDashoffset={C}
          />
          <circle
            className="seal-wax"
            cx="100"
            cy="100"
            r="76"
            fill="#6E1F24"
            style={{ opacity: done ? 1 : 0, transform: done ? "scale(1)" : "scale(0.86)" }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center font-serif text-5xl tracking-[0.06em] text-fildisi"
          aria-hidden="true"
        >
          TR
        </span>
      </button>

      <div className="min-h-[180px] text-center md:text-left">
        <p id="seal-hint" className="label" aria-live="polite">
          {done ? t.done : t.hint}
        </p>
        <dl className="mt-6 flex flex-col gap-4">
          {t.lines.map(([k, v], i) => (
            <div
              key={k}
              className="transition-[opacity,transform] duration-[1000ms] ease-[var(--ease)]"
              style={{
                opacity: done ? 1 : 0.18,
                transform: done ? "none" : "translateY(8px)",
                transitionDelay: done ? `${200 + i * 140}ms` : "0ms",
              }}
            >
              <dt className="label !text-[10px]">{k}</dt>
              <dd className="font-serif text-2xl leading-snug">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
