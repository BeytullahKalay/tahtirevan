"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Piece } from "@/lib/catalog";
import { ROUTES, type Lang } from "@/lib/i18n";
import { prefetchTexture } from "@/lib/media";
import { useCatalog } from "./CatalogProvider";
import { ChairStudio } from "./ChairStudio";

const COPY = {
  tr: {
    title: "Kişiselleştirme",
    fabric: "Kumaş",
    fabricNote: "Desen kütüphanesinden, desen koduna göre",
    wood: "Gövde ahşabı",
    finish: "Kaplama",
    size: "Ölçü",
    selected: "Seçiminiz",
    suits: "Bu parçaya uygun",
    cta: "Bu parça için görüşme talep et",
    catalog: "Kataloğu PDF olarak iste",
    note: "Seçim bağlayıcı değildir. Numune kutusu ve son karar görüşmeden sonra gelir.",
    preview: "Kumaşı koltukta görün",
    drag: "Sürükle · çevir",
    aria: "Seçilen kumaşla üç boyutlu koltuk önizlemesi",
    loading: "Kumaş yükleniyor",
  },
  en: {
    title: "Personalisation",
    fabric: "Fabric",
    fabricNote: "From the pattern library, grouped by code",
    wood: "Frame wood",
    finish: "Finish",
    size: "Dimensions",
    selected: "Your selection",
    suits: "Suited to this piece",
    cta: "Request a consultation for this piece",
    catalog: "Request the catalogue as a PDF",
    note: "Nothing here is binding. The sample box and the final choice come after we speak.",
    preview: "See the fabric on the chair",
    drag: "Drag · turn",
    aria: "Three-dimensional chair preview in the chosen fabric",
    loading: "Loading fabric",
  },
};

function Swatch({ src }: { src: string }) {
  return (
    <span aria-hidden="true" className="relative block h-full w-full">
      <Image src={src} alt="" fill unoptimized className="object-cover transition-transform duration-700 group-hover:scale-125" />
    </span>
  );
}

export function Customizer({ lang, piece }: { lang: Lang; piece: Piece }) {
  const t = COPY[lang];
  const { fabrics, getCode, options, codes: patternCodes, getFabric } = useCatalog();
  const [fabric, setFabric] = useState(piece.fabric);
  const [wood, setWood] = useState(piece.wood);
  const [finish, setFinish] = useState(piece.finish);
  const [size, setSize] = useState("standart");

  const chosenFabric = getFabric(fabric);
  const woods = options.woods.filter((w) => piece.woods.includes(w.id));

  const query = useMemo(() => {
    const q = new URLSearchParams({ parca: piece.id, kumas: fabric, ahsap: wood, kaplama: finish, olcu: size });
    return q.toString();
  }, [piece.id, fabric, wood, finish, size]);

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
      {/* 3B önizleme: telefonda kumaş seçerken ekranın üstünde sabit kalır, değişiklik hep görünür */}
      <div className="sticky top-0 z-20 -mx-[var(--gutter)] self-start bg-gece px-[var(--gutter)] pb-3 pt-2 shadow-[0_18px_24px_-12px_rgba(20,17,15,1)] lg:top-24 lg:col-span-5 lg:mx-0 lg:bg-transparent lg:p-0 lg:shadow-none">
        <div
          className="relative transition-[background] duration-[1200ms]"
          style={{ background: `radial-gradient(55% 50% at 50% 55%, ${chosenFabric.colors[0]}55 0%, transparent 72%)` }}
        >
          <ChairStudio
            fabric={chosenFabric}
            model={piece.model}
            photo={piece.photo?.src}
            className="h-[34svh] w-full lg:aspect-square lg:h-auto"
            label={`${t.aria}: ${chosenFabric.name}`}
            loadingLabel={t.loading}
          />
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-4 lg:mt-3">
          <p className="label">
            <span className="lg:hidden">{chosenFabric.name}</span>
            <span className="hidden lg:inline">{t.preview}</span>
          </p>
          <p className="label !text-[10px]">{t.drag}</p>
        </div>
      </div>

      <div className="min-w-0 lg:col-span-7">
      <h2 className="display-sm">{t.title}</h2>

      {/* Kumaş numune şeridi: desen kodlarına göre gruplu */}
      <fieldset className="mt-10 min-w-0">
        <legend className="label">
          {t.fabric} · <span className="normal-case tracking-normal">{t.fabricNote}</span>
        </legend>
        <div className="mt-6 grid gap-x-12 gap-y-8 md:grid-cols-2">
          {patternCodes.map((code) => {
            const list = fabrics.filter((f) => f.code === code.id);
            return (
              <div key={code.id} className="min-w-0">
                <p className="font-serif text-xl italic text-fildisi/90">{code.name[lang]}</p>
                <div
                  className="-mx-1 mt-3 flex gap-3 overflow-x-auto px-1 pb-2 lg:flex-wrap lg:overflow-visible"
                  role="radiogroup"
                  aria-label={`${t.fabric}: ${code.name[lang]}`}
                >
                  {list.map((f) => {
                    const on = f.id === fabric;
                    const suits = f.suitableFor.includes(piece.type);
                    return (
                      <button
                        key={f.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setFabric(f.id)}
                        onPointerEnter={() => prefetchTexture(f.tex)}
                        onFocus={() => prefetchTexture(f.tex)}
                        onTouchStart={() => prefetchTexture(f.tex)}
                        className="group flex w-[92px] shrink-0 flex-col items-start gap-2 text-left"
                      >
                        <span
                          className={`block h-[92px] w-[92px] overflow-hidden outline outline-1 outline-offset-[3px] transition-[outline-color] duration-700 ${
                            on ? "outline-altin" : "outline-transparent group-hover:outline-tas/60"
                          }`}
                        >
                          <Swatch src={f.swatch} />
                        </span>
                        <span className={`text-[13px] leading-tight ${on ? "text-fildisi" : "text-tas"}`}>{f.name}</span>
                        {suits && <span className="sr-only">{t.suits}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-12 grid gap-10 sm:grid-cols-3">
        <OptionGroup label={t.wood} value={wood} onChange={setWood} items={woods} lang={lang} />
        <OptionGroup label={t.finish} value={finish} onChange={setFinish} items={options.finishes} lang={lang} />
        <OptionGroup label={t.size} value={size} onChange={setSize} items={options.sizes} lang={lang} />
      </div>

      <div className="mt-14 border-t hairline pt-8" aria-live="polite">
        <p className="label">{t.selected}</p>
        <p className="mt-3 font-serif text-2xl leading-snug">
          {piece.name} · {chosenFabric.name}{" "}
          <span className="text-tas">({getCode(chosenFabric.code).name[lang]})</span>
        </p>
        <p className="mt-1 text-tas">
          {options.woods.find((w) => w.id === wood)?.[lang]} · {options.finishes.find((f) => f.id === finish)?.[lang]} ·{" "}
          {options.sizes.find((s) => s.id === size)?.[lang]}
        </p>
      </div>

      <div className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-10">
        <Link href={`${ROUTES.consultation[lang]}?${query}`} className="btn">
          {t.cta}
        </Link>
        <Link href={`${ROUTES.consultation[lang]}?parca=${piece.id}&talep=katalog`} className="link-gold label tap !text-fildisi">
          {t.catalog}
        </Link>
      </div>
      <p className="mt-6 max-w-[52ch] text-sm text-tas">{t.note}</p>
      </div>
    </div>
  );
}

function OptionGroup({
  label,
  value,
  onChange,
  items,
  lang,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  items: { id: string; tr: string; en: string }[];
  lang: Lang;
}) {
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="mt-4 flex flex-col gap-2" role="radiogroup" aria-label={label}>
        {items.map((it) => {
          const on = it.id === value;
          return (
            <button
              key={it.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(it.id)}
              className={`tap flex items-baseline gap-3 text-left transition-colors duration-700 ${on ? "text-fildisi" : "text-tas hover:text-fildisi"}`}
            >
              <span
                aria-hidden="true"
                className={`mt-[0.35em] inline-block h-2 w-2 shrink-0 rounded-full border transition-colors duration-700 ${
                  on ? "border-altin bg-altin" : "border-tas"
                }`}
              />
              {it[lang]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
