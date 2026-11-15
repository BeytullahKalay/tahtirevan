import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionsView } from "@/components/views/CollectionsView";
import { PieceView } from "@/components/views/PieceView";
import { LEGAL_META, LegalView, type LegalKey } from "@/components/views/LegalView";
import { getCatalog } from "./catalog.server";
import { collectionHref, pieceHref, ROUTES, type Lang } from "./i18n";
import { pageMeta, routeMeta } from "./seo";

type PieceParams = { col: string; piece: string };

/** Parça sayfası: TR ve EN rotaları aynı yapıyı paylaşır. */
export function piecePage(lang: Lang, colKey: string, pieceKey: string) {
  const read = (p: Record<string, string>): PieceParams => ({ col: p[colKey], piece: p[pieceKey] });

  return {
    generateStaticParams: async () => {
      const { pieces } = await getCatalog();
      return pieces.map((p) => ({ [colKey]: p.colSlug[lang], [pieceKey]: p.slug[lang] }));
    },
    generateMetadata: async ({ params }: { params: Promise<Record<string, string>> }): Promise<Metadata> => {
      const { col, piece } = read(await params);
      const { findPieceBySlug, getFabric, typeLabel, slugs } = await getCatalog();
      const p = findPieceBySlug(lang, col, piece);
      if (!p) return {};
      const type = typeLabel(p.type, lang);
      const fabric = getFabric(p.fabric);
      return pageMeta(
        lang,
        pieceHref(lang, p),
        `${p.name} ${type}`,
        lang === "tr"
          ? `${p.name} ${type.toLocaleLowerCase("tr")}, ${fabric.name} kumaşla. ${p.hours} saatlik el işçiliği, numaralı ve imzalı.`
          : `The ${p.name} ${type.toLowerCase()} in ${fabric.name}. ${p.hours} hours of handwork, numbered and signed.`,
        slugs,
      );
    },
    Page: async ({ params }: { params: Promise<Record<string, string>> }) => {
      const { col, piece } = read(await params);
      const { findPieceBySlug } = await getCatalog();
      const p = findPieceBySlug(lang, col, piece);
      if (!p) notFound();
      return <PieceView lang={lang} piece={p} />;
    },
  };
}

/** Tek koleksiyon sayfası. */
export function collectionPage(lang: Lang, colKey: string) {
  return {
    generateStaticParams: async () => (await getCatalog()).collections.map((c) => ({ [colKey]: c.slug[lang] })),
    generateMetadata: async ({ params }: { params: Promise<Record<string, string>> }): Promise<Metadata> => {
      const { findCollectionBySlug, slugs } = await getCatalog();
      const col = findCollectionBySlug(lang, (await params)[colKey]);
      if (!col) return {};
      return pageMeta(lang, collectionHref(lang, col), `${col.name[lang]} · ${lang === "tr" ? "Koleksiyon" : "Collection"}`, col.line[lang], slugs);
    },
    Page: async ({ params }: { params: Promise<Record<string, string>> }) => {
      const { findCollectionBySlug } = await getCatalog();
      const col = findCollectionBySlug(lang, (await params)[colKey]);
      if (!col) notFound();
      return <CollectionsView lang={lang} only={col.id} />;
    },
  };
}

export function legalPage(lang: Lang, doc: LegalKey) {
  const m = LEGAL_META[doc][lang];
  return {
    metadata: routeMeta(lang, doc, m.title, m.description),
    Page: () => <LegalView lang={lang} doc={doc} />,
  };
}

export { ROUTES };
