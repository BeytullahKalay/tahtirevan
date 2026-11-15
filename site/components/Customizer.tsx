"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { fabrics, getCode, options, patternCodes, type Piece } from "@/lib/content";
import { ROUTES, type Lang } from "@/lib/i18n";

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
  },
};

function Swatch({ colors }: { colors: string[] }) {
  const [a, b = a, c = b] = colors;
  return (
    <span
      aria-hidden="true"
      className="block h-full w-full"
      style={{
        background: `radial-gradient(70% 70% at 25% 30%, ${a} 0%, transparent 72%), radial-gradient(60% 60% at 78% 70%, ${b} 0%, transparent 72%), radial-gradient(50% 50% at 40% 90%, ${c} 0%, transparent 70%), #1d1814`,
      }}
    />
  );
}

export function Customizer({ lang, piece }: { lang: Lang; piece: Piece }) {
  const t = COPY[lang];
  const [fabric, setFabric] = useState(piece.fabric);
  const [wood, setWood] = useState(piece.wood);
  const [finish, setFinish] = useState(piece.finish);
  const [size, setSize] = useState("standart");

  const chosenFabric = fabrics.find((f) => f.id === fabric)!;
  const woods = options.woods.filter((w) => piece.woods.includes(w.id));

  const query = useMemo(() => {
    const q = new URLSearchParams({ parca: piece.id, kumas: fabric, ahsap: wood, kaplama: finish, olcu: size });
    return q.toString();
  }, [piece.id, fabric, wood, finish, size]);

  return (
    <div>
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
                <div className="-mx-1 mt-3 flex gap-3 overflow-x-auto px-1 pb-2" role="radiogroup" aria-label={`${t.fabric}: ${code.name[lang]}`}>
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
                        className="group flex w-[92px] shrink-0 flex-col items-start gap-2 text-left"
                      >
                        <span
                          className={`block h-[92px] w-[92px] overflow-hidden outline outline-1 outline-offset-[3px] transition-[outline-color] duration-700 ${
                            on ? "outline-altin" : "outline-transparent group-hover:outline-tas/60"
                          }`}
                        >
                          <Swatch colors={f.colors} />
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
