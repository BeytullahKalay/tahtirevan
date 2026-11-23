"use client";

import Link from "next/link";
import { useState } from "react";
import type { PieceType } from "@/lib/catalog";
import { collectionHref, href, type Lang } from "@/lib/i18n";
import { useCatalog } from "../CatalogProvider";
import { PieceCard } from "../PieceCard";
import { Reveal } from "../Reveal";

type Tab = "all" | PieceType;

const COPY = {
  tr: {
    label: "Koleksiyon",
    title: "Her taht, sahibini bekler.",
    line: "Her koleksiyon yolun bir durağıdır. Parçalar siparişle, sahibine göre yapılır.",
    all: "Tümü",
    tabs: "Parça türü",
    viewAll: "Tüm koleksiyonlar",
    empty: "Bu koleksiyonda bu türde bir parça yok. Size özel olarak yapılabilir.",
    askBespoke: "Size özel sipariş",
    soonTitle: "İlk parçalar hazırlanıyor.",
    soonLine: "Kuruluş serisinden bir parça için şimdiden görüşme talep edebilirsiniz. Kumaşınızı ve ölçünüzü birlikte seçeriz.",
    soonCta: "Kuruluş siparişi için görüşme",
    studies: "Kumaşlarla düşünülmüş etütleri görün",
  },
  en: {
    label: "Collection",
    title: "Every throne awaits its owner.",
    line: "Each collection is a stop on the road. Every piece is made to order, for its owner.",
    all: "All",
    tabs: "Piece type",
    viewAll: "All collections",
    empty: "There is no piece of this kind in this collection yet. One can be made for you.",
    askBespoke: "Bespoke commission",
    soonTitle: "The first pieces are in preparation.",
    soonLine: "You can already request a consultation for a piece from the founding series. We choose the fabric and the size together.",
    soonCta: "Consult on a founding piece",
    studies: "See the studies imagined in our fabrics",
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
  const { collections, pieces, piecesByCollection, typeLabel, options } = useCatalog();
  const [tab, setTab] = useState<Tab>("all");
  const list = only ? collections.filter((col) => col.id === only) : collections;
  const single = only ? list[0] : undefined;
  const shown = single ? piecesByCollection(single.id) : pieces;
  // Sekmeler yalnızca gösterilecek parça varsa ve birden çok tür varsa anlamlı
  const types = options.typeOrder.filter((t) => shown.some((p) => p.type === t));
  const tabs: Tab[] = types.length > 1 ? [...types, "all"] : [];

  return (
    <div className="px-[var(--gutter)] pb-[12vh] pt-36 lg:pt-48">
      <Reveal as="header" className="max-w-[900px]">
        <p className="label">{single ? single.stop[lang] || c.label : c.label}</p>
        <h1 className="display mt-4">{single ? single.name[lang] : c.title}</h1>
        <p className="lede mt-8 max-w-[50ch] !text-tas">{single ? single.line[lang] : c.line}</p>
        {single && (
          <Link href={href(lang, "collections")} className="link-gold is-static label tap mt-8 !text-fildisi">
            {c.viewAll}
          </Link>
        )}
      </Reveal>

      {tabs.length > 0 && (
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
      )}

      <div id="piece-panel" role={tabs.length > 0 ? "tabpanel" : undefined} className="flex flex-col gap-[16vh] pt-[10vh]">
        {list.map((col, ci) => {
          const all = piecesByCollection(col.id);
          const items = all.filter((p) => tab === "all" || p.type === tab);
          if (all.length > 0 && items.length === 0 && !only) return null;
          return (
            <section key={col.id} aria-labelledby={`col-${col.id}`}>
              {!only && (
                <Reveal className="mb-12 flex flex-col gap-3 border-t hairline pt-8 md:flex-row md:items-baseline md:justify-between">
                  <div>
                    <p className="label">{col.stop[lang] || c.label}</p>
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

              {all.length === 0 ? (
                <Reveal className="grid gap-10 lg:grid-cols-12">
                  <div className="lg:col-span-6">
                    {col.intro[lang] && <p className="lede max-w-[46ch]">{col.intro[lang]}</p>}
                  </div>
                  <div className="lg:col-span-5 lg:col-start-8">
                    <h3 className="display-sm">{c.soonTitle}</h3>
                    <p className="mt-5 max-w-[42ch] text-tas">{c.soonLine}</p>
                    <div className="mt-10 flex flex-col items-start gap-6">
                      <Link href={href(lang, "consultation")} className="btn">
                        {c.soonCta}
                      </Link>
                      <Link href={href(lang, "patterns")} className="link-gold is-static label tap !text-fildisi">
                        {c.studies}
                      </Link>
                    </div>
                  </div>
                </Reveal>
              ) : items.length === 0 ? (
                <p className="text-tas">
                  {c.empty}{" "}
                  <Link href={href(lang, "bespoke")} className="link-gold is-static text-fildisi">
                    {c.askBespoke}
                  </Link>
                </p>
              ) : (
                <>
                  {col.intro[lang] && <p className="lede mb-16 max-w-[56ch] !text-tas">{col.intro[lang]}</p>}
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
                </>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
