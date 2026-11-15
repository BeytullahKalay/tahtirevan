"use client";

import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { Media, type Shot } from "./Media";

type Item = { shot: Shot; subject: string; colors?: string[]; fabric?: string };

/** Detay galerisi: tıklayınca büyür, büyük görselde tıklanan noktaya yakınlaşır. */
export function Gallery({ lang, items }: { lang: Lang; items: Item[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [zoom, setZoom] = useState<{ on: boolean; x: number; y: number }>({ on: false, x: 50, y: 50 });

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (active !== null && !d.open) d.showModal();
    if (active === null && d.open) d.close();
  }, [active]);

  const close = () => {
    setActive(null);
    setZoom({ on: false, x: 50, y: 50 });
  };

  const t =
    lang === "tr"
      ? { open: "Büyüt", close: "Kapat", next: "Sonraki", prev: "Önceki", zoom: "Yakınlaştırmak için tıklayın" }
      : { open: "Enlarge", close: "Close", next: "Next", prev: "Previous", zoom: "Click to zoom" };

  const layout = [
    { cell: "col-span-2 md:col-span-7", aspect: "aspect-[4/5]" },
    { cell: "col-span-1 md:col-span-5 md:mt-24", aspect: "aspect-[4/5]" },
    { cell: "col-span-1 md:col-span-5", aspect: "aspect-[4/5] md:aspect-square" },
    { cell: "col-span-2 md:col-span-7 md:-mt-16", aspect: "aspect-[16/11]" },
  ];

  return (
    <>
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-12 md:gap-6">
        {items.map((it, i) => (
          <li key={i} className={layout[i % layout.length].cell}>
            <button
              type="button"
              className="block w-full text-left"
              onClick={() => setActive(i)}
              aria-label={`${t.open}: ${it.subject}`}
            >
              <Media
                lang={lang}
                shot={it.shot}
                subject={it.subject}
                colors={it.colors}
                fabric={it.fabric}
                detail={i}
                className={`w-full ${layout[i % layout.length].aspect}`}
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        onClose={close}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
        className="m-0 h-full max-h-none w-full max-w-none bg-gece/95 p-0 text-fildisi backdrop:bg-gece/80"
        aria-label={active !== null ? items[active].subject : undefined}
      >
        {active !== null && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-[var(--gutter)] py-5">
              <span className="label">
                {active + 1} / {items.length}
              </span>
              <button type="button" className="label tap link-gold !text-fildisi" onClick={close} autoFocus>
                {t.close}
              </button>
            </div>
            <div className="relative flex-1 overflow-hidden px-[var(--gutter)]">
              <button
                type="button"
                className="relative block h-full w-full cursor-zoom-in overflow-hidden"
                aria-label={t.zoom}
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setZoom((z) => ({
                    on: !z.on,
                    x: ((e.clientX - r.left) / r.width) * 100,
                    y: ((e.clientY - r.top) / r.height) * 100,
                  }));
                }}
              >
                <div
                  className="absolute inset-0 transition-transform duration-[900ms] ease-[var(--ease)]"
                  style={{ transform: zoom.on ? "scale(2.2)" : "scale(1)", transformOrigin: `${zoom.x}% ${zoom.y}%` }}
                >
                  <Media
                    lang={lang}
                    shot={items[active].shot}
                    subject={items[active].subject}
                    colors={items[active].colors}
                    fabric={items[active].fabric}
                    detail={active}
                    className="absolute inset-0"
                    zoom={false}
                    cursor={false}
                  />
                </div>
              </button>
            </div>
            <div className="flex items-center justify-between px-[var(--gutter)] py-5">
              <button
                type="button"
                className="label tap link-gold !text-fildisi"
                onClick={() => {
                  setZoom({ on: false, x: 50, y: 50 });
                  setActive((a) => (a! - 1 + items.length) % items.length);
                }}
              >
                {t.prev}
              </button>
              <p className="hidden font-serif text-xl italic md:block">{items[active].subject}</p>
              <button
                type="button"
                className="label tap link-gold !text-fildisi"
                onClick={() => {
                  setZoom({ on: false, x: 50, y: 50 });
                  setActive((a) => (a! + 1) % items.length);
                }}
              >
                {t.next}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
