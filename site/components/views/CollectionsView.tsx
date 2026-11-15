"use client";

import Link from "next/link";
import { useState } from "react";
import { collections, getCode, piecesByCollection, typeLabel, type PieceType } from "@/lib/content";
import { collectionHref, href, ROUTES, type Lang } from "@/lib/i18n";
import { PieceCard } from "../PieceCard";
import { Reveal } from "../Reveal";

type Tab = "all" | PieceType;

const COPY = {
  tr: {
    label: "Koleksiyon",
    title: "Her taht, sahibini bekler.",
    line: "Dört desen kodu, dört koleksiyon. Her parça siparişle ve sahibine göre yapılır; burada gördükleriniz başlangıç noktasıdır.",
    all: "Tümü",
    tabs: "Parça türü",
    code: "Desen kodu",
    viewAll: "Tüm koleksiyonlar",
    empty: "Bu koleksiyonda bu türde bir parça yok. Size özel olarak yapılabilir.",
    askBespoke: "Size özel sipariş",
  },
  en: {
    label: "Collection",
    title: "Every throne awaits its owner.",
    line: "Four pattern codes, four collections. Each piece is made to order for its owner; what you see here is where it starts.",
    all: "All",
    tabs: "Piece type",
    code: "Pattern code",
    viewAll: "All collections",
    empty: "There is no piece of this kind in this collection yet. One can be made for you.",
    askBespoke: "Bespoke commission",
  },
};

// Asimetrik ızgara: her üç kartta bir değişen düzen
const LAYOUT = [
  { wrap: "lg:col-span-7", aspect: "aspect-[4/5]" },
  { wrap: "lg:col-span-5 lg:mt-40", aspect: "aspect-[3/4]" },
  { wrap: "lg:col-span-8 lg:col-start-3", aspect: "aspect-[4/5] sm:aspect-[16/10]" },
];

export function CollectionsView({ lang, only }: { lang: Lang; only?: string }) {
  const c = COPY[lang];
  const [tab, setTab] = useState<Tab>("all");
  const tabs: Tab[] = ["koltuk", "kanepe", "sedir", "all"];
  const list = only ? collections.filter((col) => col.id === only) : collections;
  const single = only ? list[0] : undefined;

  return (
    <div className="px-[var(--gutter)] pb-[12vh] pt-36 lg:pt-48">
      <Reveal as="header" className="max-w-[900px]">
        <p className="label">{single ? `${c.code} · ${getCode(single.code).name[lang]}` : c.label}</p>
        <h1 className="display mt-4">{single ? single.name[lang] : c.title}</h1>
        <p className="lede mt-8 max-w-[50ch] !text-tas">{single ? single.line[lang] : c.line}</p>
        {single && (
          <Link href={href(lang, "collections")} className="link-gold is-static label tap mt-8 !text-fildisi">
            {c.viewAll}
          </Link>
        )}
      </Reveal>

      <div role="tablist" aria-label={c.tabs} className="mt-16 flex flex-wrap gap-x-8 gap-y-3 border-b hairline pb-4">
        {tabs.map((tb) => (
          <button
            key={tb}
            role="tab"
            type="button"
            aria-selected={tab === tb}
            aria-controls="piece-panel"
            onClick={() => setTab(tb)}
            className={`label link-gold tap transition-colors duration-700 ${tab === tb ? "!text-fildisi" : "hover:!text-fildisi"}`}
          >
            {tb === "all" ? c.all : typeLabel(tb, lang, true)}
          </button>
        ))}
      </div>

      <div id="piece-panel" role="tabpanel" className="flex flex-col gap-[16vh] pt-[10vh]">
        {list.map((col, ci) => {
          const items = piecesByCollection(col.id).filter((p) => tab === "all" || p.type === tab);
          if (items.length === 0 && !only) return null;
          return (
            <section key={col.id} aria-labelledby={`col-${col.id}`}>
              {!only && (
                <Reveal className="mb-12 flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between">
                  <div>
                    <p className="label">
                      {c.code} · {getCode(col.code).name[lang]}
                    </p>
                    <h2 id={`col-${col.id}`} className="display-md mt-3">
                      <Link href={collectionHref(lang, col)} className="link-gold">
                        {col.name[lang]}
                      </Link>
                    </h2>
                  </div>
                  <p className="max-w-[40ch] text-tas">{col.line[lang]}</p>
                </Reveal>
              )}
              {only && <h2 id={`col-${col.id}`} className="sr-only">{col.name[lang]}</h2>}
              {items.length === 0 ? (
                <p className="text-tas">
                  {c.empty}{" "}
                  <Link href={ROUTES.bespoke[lang]} className="link-gold is-static text-fildisi">
                    {c.askBespoke}
                  </Link>
                </p>
              ) : (
                <div className="grid gap-x-8 gap-y-20 lg:grid-cols-12">
                  {items.map((p, i) => {
                    const l = LAYOUT[i % LAYOUT.length];
                    return (
                      <Reveal key={p.id} className={l.wrap} delay={(i % 2) * 0.12}>
                        <PieceCard piece={p} lang={lang} aspect={l.aspect} priority={ci === 0 && i < 2} />
                      </Reveal>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
