import Link from "next/link";
import {
  cmToIn,
  getCode,
  getCollection,
  getFabric,
  getFinish,
  getWood,
  kgToLb,
  piecesByCollection,
  typeLabel,
  type Piece,
} from "@/lib/content";
import { collectionHref, ROUTES, pieceHref, type Lang } from "@/lib/i18n";
import { SITE_URL } from "@/lib/seo";
import { Customizer } from "../Customizer";
import { Gallery } from "../Gallery";
import { JsonLd } from "../JsonLd";
import { Media } from "../Media";
import { Parallax } from "../Parallax";
import { PieceCard } from "../PieceCard";
import { Reveal } from "../Reveal";

const COPY = {
  tr: {
    story: "Parçanın hikâyesi",
    fabric: "Kumaş ve desen",
    code: "Desen kodu",
    seeCode: "Bu desen kodunu inceleyin",
    fabricHonest: "Desen yalnızca Tahtırevan için çizilir ve kumaşa baskıyla aktarılır. El işçiliği gövdede ve döşemededir.",
    materials: "Malzeme ve ölçüler",
    wood: "Gövde",
    finish: "Kaplama",
    upholstery: "Döşeme",
    upholsteryValue: "Elle bağlanan yaylar, katman katman elde kurulan dolgu",
    dims: "Ölçüler",
    w: "Genişlik",
    d: "Derinlik",
    h: "Yükseklik",
    seat: "Oturma yüksekliği",
    weight: "Ağırlık",
    production: "Üretim",
    hours: "Tahmini işçilik",
    hoursUnit: "saat",
    lead: "Teslim süresi",
    weeks: "hafta",
    signed: "Numaralı ve imzalı",
    signedValue: "Ustanın imzası ve parça numarası gövdenin altında yer alır.",
    craft: "Gövdedeki el işçiliği",
    related: "Aynı koleksiyondan",
    back: "Koleksiyona dön",
  },
  en: {
    story: "The story",
    fabric: "Fabric and pattern",
    code: "Pattern code",
    seeCode: "Explore this pattern code",
    fabricHonest: "The pattern is drawn for Tahtırevan alone and printed onto the cloth. The handwork lives in the frame and the upholstery.",
    materials: "Materials and dimensions",
    wood: "Frame",
    finish: "Finish",
    upholstery: "Upholstery",
    upholsteryValue: "Hand-tied springs, filling built up by hand in layers",
    dims: "Dimensions",
    w: "Width",
    d: "Depth",
    h: "Height",
    seat: "Seat height",
    weight: "Weight",
    production: "Making",
    hours: "Estimated handwork",
    hoursUnit: "hours",
    lead: "Lead time",
    weeks: "weeks",
    signed: "Numbered and signed",
    signedValue: "The master's signature and the piece number sit beneath the frame.",
    craft: "Handwork on the frame",
    related: "From the same collection",
    back: "Back to the collection",
  },
};

export function PieceView({ lang, piece }: { lang: Lang; piece: Piece }) {
  const c = COPY[lang];
  const col = getCollection(piece.collection);
  const code = getCode(col.code);
  const fabric = getFabric(piece.fabric);
  const related = piecesByCollection(col.id).filter((p) => p.id !== piece.id).slice(0, 3);
  const type = typeLabel(piece.type, lang);
  const lower = type.toLocaleLowerCase(lang);

  const gallery = [
    { shot: "macro" as const, subject: `${piece.techniques[0][lang]}` },
    { shot: "fabric" as const, subject: `${fabric.name} · ${fabric.motif[lang]}`, colors: fabric.colors },
    { shot: "macro" as const, subject: `${piece.techniques[2]?.[lang] ?? piece.techniques[1][lang]}` },
    { shot: "craft" as const, subject: `${piece.techniques[1][lang]}` },
  ];

  const dimRow = (label: string, cm: number) => (
    <div className="flex items-baseline justify-between gap-6 border-b hairline py-3">
      <dt className="text-tas">{label}</dt>
      <dd>
        {cm} cm <span className="text-tas">· {cmToIn(cm)} in</span>
      </dd>
    </div>
  );

  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${piece.name} ${type}`,
    description: piece.story[lang],
    brand: { "@type": "Brand", name: "Tahtırevan" },
    category: type,
    material: `${getWood(piece.wood)[lang]}, ${fabric.name}`,
    url: `${SITE_URL}${pieceHref(lang, piece)}`,
    image: `${SITE_URL}/og.svg`,
    width: { "@type": "QuantitativeValue", value: piece.dims.w, unitCode: "CMT" },
    depth: { "@type": "QuantitativeValue", value: piece.dims.d, unitCode: "CMT" },
    height: { "@type": "QuantitativeValue", value: piece.dims.h, unitCode: "CMT" },
    weight: { "@type": "QuantitativeValue", value: piece.weightKg, unitCode: "KGM" },
  };

  return (
    <article>
      <JsonLd data={ld} />

      {/* Tam genişlik ana görsel */}
      <header className="relative">
        <Parallax className="h-[88svh] min-h-[520px] w-full" amount={80}>
          <Media
            lang={lang}
            shot="portrait"
            subject={`${piece.name} ${lower}, ${fabric.name} · ${lang === "tr" ? "boş mekânda, tek yönden ışık" : "empty room, single light source"}`}
            colors={fabric.colors}
            className="absolute inset-0"
            priority
            labelPosition="top-right"
            zoom={false}
          />
        </Parallax>
        <div className="absolute inset-x-0 bottom-0 px-[var(--gutter)] pb-10">
          <div className="rise">
            <Link href={collectionHref(lang, col)} className="label link-gold tap !text-fildisi/85">
              {col.name[lang]} · {type}
            </Link>
            <h1 className="display mt-2 [text-shadow:0_2px_30px_rgba(10,8,6,0.6)]">{piece.name}</h1>
          </div>
        </div>
      </header>

      {/* Hikâye önce gelir */}
      <section className="grid gap-10 px-[var(--gutter)] py-[14vh] lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <p className="label">{c.story}</p>
        </Reveal>
        <Reveal className="lg:col-span-8" delay={0.1}>
          <p className="font-serif text-[1.6rem] font-light leading-[1.35] md:text-[2.2rem]">{piece.story[lang]}</p>
        </Reveal>
      </section>

      {/* Detay galerisi */}
      <section className="px-[var(--gutter)] pb-[14vh]" aria-label={c.craft}>
        <Gallery lang={lang} items={gallery} />
      </section>

      {/* Kumaş ve desen kodu */}
      <section className="bg-ceviz/40 px-[var(--gutter)] py-[14vh]">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-6">
            <Media
              lang={lang}
              shot="fabric"
              subject={`${fabric.name} · ${fabric.motif[lang]}`}
              colors={fabric.colors}
              className="aspect-[4/3] w-full"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </Reveal>
          <Reveal className="lg:col-span-5 lg:col-start-8" delay={0.12}>
            <p className="label">{c.fabric}</p>
            <h2 className="display-md mt-4">{fabric.name}</h2>
            <p className="mt-4 text-tas">{fabric.motif[lang]} · {fabric.colorNotes[lang]}</p>
            <p className="mt-8 label">
              {c.code} · <span className="!text-fildisi">{code.name[lang]}</span>
            </p>
            <p className="mt-3 max-w-[44ch]">{code.description[lang]}</p>
            <Link href={`${ROUTES.patterns[lang]}#${code.slug[lang]}`} className="link-gold is-static label tap mt-8 !text-fildisi">
              {c.seeCode}
            </Link>
            <p className="mt-10 max-w-[46ch] text-sm text-tas">{c.fabricHonest}</p>
          </Reveal>
        </div>
      </section>

      {/* Malzeme, ölçü, üretim */}
      <section className="grid gap-16 px-[var(--gutter)] py-[14vh] lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <h2 className="display-sm">{c.materials}</h2>
          <dl className="mt-8">
            <div className="border-b hairline py-3">
              <dt className="label">{c.wood}</dt>
              <dd className="mt-1">{getWood(piece.wood)[lang]}</dd>
            </div>
            <div className="border-b hairline py-3">
              <dt className="label">{c.finish}</dt>
              <dd className="mt-1">{getFinish(piece.finish)[lang]}</dd>
            </div>
            <div className="border-b hairline py-3">
              <dt className="label">{c.upholstery}</dt>
              <dd className="mt-1">{c.upholsteryValue}</dd>
            </div>
          </dl>
          <p className="label mt-10">{c.dims}</p>
          <dl className="mt-2">
            {dimRow(c.w, piece.dims.w)}
            {dimRow(c.d, piece.dims.d)}
            {dimRow(c.h, piece.dims.h)}
            {dimRow(c.seat, piece.dims.seat)}
            <div className="flex items-baseline justify-between gap-6 border-b hairline py-3">
              <dt className="text-tas">{c.weight}</dt>
              <dd>
                {piece.weightKg} kg <span className="text-tas">· {kgToLb(piece.weightKg)} lb</span>
              </dd>
            </div>
          </dl>
        </Reveal>

        <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.12}>
          <h2 className="display-sm">{c.production}</h2>
          <dl className="nums mt-8 grid grid-cols-2 gap-8">
            <div>
              <dt className="label">{c.hours}</dt>
              <dd className="mt-2 font-serif text-6xl font-light leading-none">{piece.hours}</dd>
              <dd className="mt-1 text-tas">{c.hoursUnit}</dd>
            </div>
            <div>
              <dt className="label">{c.lead}</dt>
              <dd className="mt-2 font-serif text-6xl font-light leading-none">
                {piece.leadWeeks[0]}–{piece.leadWeeks[1]}
              </dd>
              <dd className="mt-1 text-tas">{c.weeks}</dd>
            </div>
          </dl>
          <div className="mt-10 border-t hairline pt-6">
            <p className="label">{c.signed}</p>
            <p className="mt-2 max-w-[44ch]">{c.signedValue}</p>
          </div>
          <div className="mt-10">
            <p className="label">{c.craft}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {piece.techniques.map((tq) => (
                <li key={tq.en} className="flex items-baseline gap-3">
                  <span className="inline-block h-px w-5 translate-y-[-0.3em] bg-altin" aria-hidden="true" />
                  {tq[lang]}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* Kişiselleştirme ve tek ana eylem */}
      <section className="border-t hairline px-[var(--gutter)] py-[14vh]">
        <div className="max-w-[1100px]">
          <Customizer lang={lang} piece={piece} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="px-[var(--gutter)] pb-[16vh]">
          <div className="flex items-baseline justify-between gap-6 border-t hairline pt-10">
            <h2 className="display-sm">{c.related}</h2>
            <Link href={collectionHref(lang, col)} className="link-gold label tap !text-fildisi">
              {c.back}
            </Link>
          </div>
          <div className="mt-12 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.12} className={i === 1 ? "lg:mt-20" : ""}>
                <PieceCard piece={p} lang={lang} aspect="aspect-[4/5]" sizes="(min-width: 1024px) 33vw, 100vw" />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
