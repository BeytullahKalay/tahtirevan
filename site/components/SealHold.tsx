"use client";

import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { Emblem } from "./Brand";

const RING_R = 96;
const C = 2 * Math.PI * RING_R;
const TEXT_R = 78;
const HOLD_MS = 1600;
const RELEASE_MS = 900;

/** Mumun düzensiz kenarı: sabit dalgalarla (her açılışta aynı) çizilmiş yuvarlak leke. */
const WAX = (() => {
  const pts: string[] = [];
  for (let i = 0; i <= 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const r = 89 + 2.6 * Math.sin(a * 7 + 0.4) + 1.6 * Math.sin(a * 11 + 1.3) + 1.1 * Math.sin(a * 17 + 2.1);
    pts.push(`${(100 + r * Math.cos(a)).toFixed(2)} ${(100 + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
})();

const COPY = {
  tr: {
    hint: "Mührü basmak için basılı tutun",
    holding: "Bırakmayın…",
    aria: "Mührü basmak için basılı tutun",
    done: "Mühürlendi",
    ring: "TAHTIREVAN · N° 001 · ATÖLYE · TAHTIREVAN · N° 001 · ATÖLYE · ",
    lines: [
      ["Numara", "N° 001"],
      ["Pirinç damga", "Her parçada, yeri parçaya göre seçilir"],
      ["Sertifika", "Parçayla birlikte teslim edilir"],
    ],
  },
  en: {
    hint: "Press and hold to set the seal",
    holding: "Keep holding…",
    aria: "Press and hold to set the seal",
    done: "Sealed",
    ring: "TAHTIREVAN · N° 001 · ATELIER · TAHTIREVAN · N° 001 · ATELIER · ",
    lines: [
      ["Number", "N° 001"],
      ["Brass seal", "On every piece, placed to suit the piece"],
      ["Certificate", "Delivered with the piece"],
    ],
  },
};

/**
 * Sitenin tek etkileşim anı: her parçanın numaralanıp mühürlenmesi.
 * Önce pirinç damga yüzü (amblem + çevre yazısı) görünür; basılı tuttukça damga gömülür ve altın halka dolar,
 * erken bırakılırsa halka yavaşça geri çekilir. Tamamlanınca lal mum mühür belirir, amblem mumda kabartma olur
 * ve sertifika satırları sırayla gelir. Hareketi azalt açıksa mühür baştan basılı gösterilir.
 */
export function SealHold({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const ring = useRef<SVGCircleElement>(null);
  const holding = useRef(false);
  const progress = useRef(0);
  const raf = useRef<number | null>(null);
  const last = useRef(0);
  const [done, setDone] = useState(false);
  const [pressing, setPressing] = useState(false);

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
    const eased = 1 - Math.pow(1 - progress.current, 2.2);
    if (ring.current) ring.current.style.strokeDashoffset = String(C * (1 - eased));
    if (progress.current >= 1) {
      raf.current = null;
      holding.current = false;
      setPressing(false);
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
    setPressing(true);
    if (raf.current === null) {
      last.current = performance.now();
      raf.current = requestAnimationFrame(tick);
    }
  };
  const stop = () => {
    holding.current = false;
    setPressing(false);
  };

  const state = done ? "done" : pressing ? "pressing" : "idle";

  return (
    <div className="flex flex-col items-center gap-12 md:flex-row md:items-center md:gap-16">
      <div className="flex shrink-0 flex-col items-center gap-6">
        <button
          type="button"
          aria-label={t.aria}
          aria-pressed={done}
          aria-describedby="seal-hint"
          data-state={state}
          className="seal group relative h-[220px] w-[220px] touch-none select-none rounded-full"
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
          {/* Bekleyen damgayı belli eden yumuşak nabız (yalnızca boştayken) */}
          <span aria-hidden="true" className="seal-pulse absolute inset-[6px] rounded-full border border-altin/50" />

          <svg viewBox="0 0 200 200" className="seal-face absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            <defs>
              <radialGradient id="seal-brass" cx="38%" cy="32%" r="75%">
                <stop offset="0%" stopColor="#3a2f22" />
                <stop offset="60%" stopColor="#231c15" />
                <stop offset="100%" stopColor="#17120e" />
              </radialGradient>
              <radialGradient id="seal-wax-fill" cx="36%" cy="30%" r="80%">
                <stop offset="0%" stopColor="#8f2c32" />
                <stop offset="55%" stopColor="#6E1F24" />
                <stop offset="100%" stopColor="#4a1317" />
              </radialGradient>
              <path id="seal-arc" d={`M100 ${100 - TEXT_R}A${TEXT_R} ${TEXT_R} 0 1 1 99.99 ${100 - TEXT_R}`} />
            </defs>

            {/* İlerleme halkası */}
            <circle cx="100" cy="100" r={RING_R} fill="none" stroke="rgba(154,143,128,0.28)" strokeWidth="1" />
            <circle
              ref={ring}
              className="seal-ring"
              cx="100"
              cy="100"
              r={RING_R}
              fill="none"
              stroke="#B08D57"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C}
              transform="rotate(-90 100 100)"
            />

            {/* Pirinç damga yüzü */}
            <g className="seal-brass">
              <circle cx="100" cy="100" r="88" fill="url(#seal-brass)" stroke="#B08D57" strokeOpacity="0.55" strokeWidth="1" />
              <circle cx="100" cy="100" r="68" fill="none" stroke="#B08D57" strokeOpacity="0.35" strokeWidth="0.75" />
            </g>

            {/* Mum */}
            <g className="seal-wax">
              <path d={WAX} fill="url(#seal-wax-fill)" />
              <circle cx="100" cy="100" r="70" fill="none" stroke="#3d0e12" strokeOpacity="0.55" strokeWidth="1.2" />
              <circle cx="100" cy="100" r="69" fill="none" stroke="#c0565c" strokeOpacity="0.25" strokeWidth="0.6" />
            </g>

            {/* Çevre yazısı: damgada altın, mumda kabartma */}
            <text className="seal-text" fontSize="8.2" letterSpacing="1.2" fontFamily="var(--font-sans, sans-serif)">
              <textPath href="#seal-arc" textLength={2 * Math.PI * TEXT_R - 6} lengthAdjust="spacing">
                {t.ring}
              </textPath>
            </text>
          </svg>

          <span aria-hidden="true" className="seal-emblem absolute inset-0 flex items-center justify-center">
            <Emblem className="h-auto w-[88px] translate-y-[-3px]" />
          </span>
        </button>

        <p id="seal-hint" className="label min-h-[1.5em] text-center" aria-live="polite">
          {done ? t.done : pressing ? t.holding : t.hint}
        </p>
      </div>

      <dl className="flex min-h-[180px] flex-col gap-4 text-center md:text-left">
        {t.lines.map(([k, v], i) => (
          <div
            key={k}
            className="transition-[opacity,transform] duration-[1000ms] ease-[var(--ease)]"
            style={{
              opacity: done ? 1 : 0.18,
              transform: done ? "none" : "translateY(8px)",
              transitionDelay: done ? `${300 + i * 140}ms` : "0ms",
            }}
          >
            <dt className="label !text-[10px]">{k}</dt>
            <dd className="font-serif text-2xl leading-snug">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
