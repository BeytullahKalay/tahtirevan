"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { Fabric } from "@/lib/catalog";
import { prefetchTexture } from "@/lib/media";
import { countWord } from "@/lib/words";
import { useCatalog } from "./CatalogProvider";
import type { Lang } from "@/lib/i18n";
import { ChairStudio } from "./ChairStudio";
import { newCtrl } from "./three/ctrl";

const COPY = {
  tr: {
    label: "Kumaş stüdyosu",
    title: (n: number) => `Bir koltuk, ${countWord(n, "tr")} kumaş.`,
    line: "Bir kumaşa dokunun, koltuk onu giysin. Sürükleyerek çevirin; kaydırdıkça yaklaşın.",
    drag: "Sürükle · çevir",
    code: "Desen kodu",
    aria: "Üç boyutlu Serir koltuk",
    loading: "Kumaş yükleniyor",
  },
  en: {
    label: "Fabric studio",
    title: (n: number) => `One chair, ${countWord(n, "en")} fabrics.`,
    line: "Touch a fabric and the chair puts it on. Drag to turn it; scroll to come closer.",
    drag: "Drag · turn",
    code: "Pattern code",
    aria: "Three-dimensional Serir armchair",
    loading: "Loading fabric",
  },
};

const clamp = (v: number) => Math.min(1, Math.max(0, v));

export function ChairShowroom({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const ref = useRef<HTMLElement>(null);
  const ctrl = useRef(newCtrl());
  const reduce = useReducedMotion();
  const { fabrics, codes: patternCodes, getCode, getFabric, site } = useCatalog();
  const [fabricId, setFabricId] = useState(() => patternCodes[0]?.lead ?? fabrics[0].id);
  const fabric = getFabric(fabricId);
  const code = getCode(fabric.code);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduce) return;
    ctrl.current.rot = -0.5 + p * Math.PI * 2;
    ctrl.current.zoom = Math.sin(Math.PI * clamp((p - 0.18) / 0.64)) * 0.82;
  });
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={ref} className="relative h-[280svh]" aria-labelledby="studio-title">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Kumaşın renginden gelen ışık */}
        <div
          className="absolute inset-0 transition-[background] duration-[1400ms]"
          aria-hidden="true"
          style={{
            background: `radial-gradient(48% 55% at 64% 58%, ${fabric.colors[0]}5c 0%, transparent 70%), radial-gradient(30% 30% at 80% 20%, ${fabric.colors[1] ?? fabric.colors[0]}26 0%, transparent 70%), #14110f`,
          }}
        />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={fabric.id}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute bottom-[-0.12em] right-[-0.04em] select-none font-serif text-[30vw] font-light leading-none text-fildisi/[0.045] lg:text-[19vw]"
            aria-hidden="true"
          >
            {fabric.name}
          </motion.p>
        </AnimatePresence>

        <div className="relative z-10 flex h-full flex-col lg:flex-row">
          {/* Metin ve numune seçici */}
          <div className="flex flex-col px-[var(--gutter)] pt-24 lg:w-[40%] lg:justify-center lg:pt-0">
            <p className="label">{t.label}</p>
            <h2 id="studio-title" className="display-md mt-3 max-w-[14ch]">
              {t.title(fabrics.length)}
            </h2>
            <p className="mt-4 hidden max-w-[40ch] text-tas md:block">{t.line}</p>

            <div className="mt-6 min-h-[4.5rem] lg:mt-10" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={fabric.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="font-serif text-3xl italic leading-tight lg:text-4xl">{fabric.name}</p>
                  <p className="mt-1 text-sm text-tas">
                    {t.code} · {code.name[lang]} — {fabric.motif[lang]}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Masaüstü: kodlara göre gruplu */}
            <div className="mt-8 hidden flex-col gap-4 lg:flex">
              {patternCodes.map((c) => (
                <div key={c.id} className="flex items-center gap-4">
                  <span className="label w-20 shrink-0 !text-[10px]">{c.name[lang]}</span>
                  <div className="flex gap-3" role="radiogroup" aria-label={c.name[lang]}>
                    {fabrics
                      .filter((f) => f.code === c.id)
                      .map((f) => (
                        <Swatch key={f.id} fabric={f} on={f.id === fabricId} onPick={setFabricId} />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3B koltuk */}
          <div className="relative min-h-0 flex-1">
            <ChairStudio
              fabric={fabric}
              model={site.studioModel}
              ctrl={ctrl}
              className="absolute inset-0"
              label={`${t.aria}, ${fabric.name}`}
              loadingLabel={t.loading}
            />
            <p className="label pointer-events-none absolute bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 !text-[10px] lg:bottom-10">
              {t.drag}
            </p>
          </div>
        </div>

        {/* Mobil: yatay numune şeridi */}
        <div
          className="absolute inset-x-0 bottom-0 z-20 flex gap-3 overflow-x-auto px-[var(--gutter)] pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 lg:hidden"
          role="radiogroup"
          aria-label={t.label}
        >
          {fabrics.map((f) => (
            <Swatch key={f.id} fabric={f} on={f.id === fabricId} onPick={setFabricId} />
          ))}
        </div>

        <motion.div className="absolute bottom-0 left-0 z-30 h-px bg-altin/70" style={{ width: bar }} aria-hidden="true" />
      </div>
    </section>
  );
}

function Swatch({ fabric, on, onPick }: { fabric: Fabric; on: boolean; onPick: (id: string) => void }) {
  const { id, name } = fabric;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      aria-label={name}
      title={name}
      onClick={() => onPick(id)}
      onPointerEnter={() => prefetchTexture(fabric.tex)}
      onFocus={() => prefetchTexture(fabric.tex)}
      onTouchStart={() => prefetchTexture(fabric.tex)}
      className={`group relative h-12 w-12 shrink-0 overflow-hidden rounded-full outline outline-1 outline-offset-[3px] transition-[outline-color,transform] duration-500 hover:scale-110 lg:h-11 lg:w-11 ${
        on ? "scale-110 outline-altin" : "outline-transparent hover:outline-tas/60"
      }`}
    >
      <Image
        src={fabric.swatch}
        alt=""
        fill
        unoptimized
        className="object-cover transition-transform duration-700 group-hover:scale-125"
      />
    </button>
  );
}
