import patternCodesData from "@/content/patternCodes.json";
import fabricsData from "@/content/fabrics.json";
import collectionsData from "@/content/collections.json";
import piecesData from "@/content/pieces.json";
import optionsData from "@/content/options.json";
import type { Lang } from "./i18n";

export type Localized = { tr: string; en: string };
export type PieceType = "koltuk" | "kanepe" | "sedir";

export type PatternCode = {
  id: string;
  order: number;
  slug: Localized;
  name: Localized;
  line: Localized;
  description: Localized;
  colors: string[];
};

export type Fabric = {
  id: string;
  name: string;
  nameStatus?: string;
  code: string;
  colors: string[];
  colorNotes: Localized;
  motif: Localized;
  scale: Localized;
  suitableFor: PieceType[];
};

export type Collection = {
  id: string;
  code: string;
  featured?: boolean;
  slug: Localized;
  name: Localized;
  line: Localized;
};

export type Piece = {
  id: string;
  collection: string;
  type: PieceType;
  featured?: boolean;
  slug: Localized;
  name: string;
  story: Localized;
  fabric: string;
  wood: string;
  finish: string;
  woods: string[];
  dims: { w: number; d: number; h: number; seat: number };
  weightKg: number;
  hours: number;
  leadWeeks: [number, number];
  techniques: Localized[];
};

export type Option = { id: string; tr: string; en: string };

export const patternCodes = (patternCodesData as PatternCode[]).sort((a, b) => a.order - b.order);
export const fabrics = fabricsData as Fabric[];
export const collections = collectionsData as Collection[];
export const pieces = piecesData as Piece[];
export const options = optionsData as {
  woods: Option[];
  finishes: Option[];
  sizes: Option[];
  types: Record<PieceType, { tr: string; en: string; trPlural: string; enPlural: string }>;
};

export const getCode = (id: string) => patternCodes.find((c) => c.id === id)!;
export const getFabric = (id: string) => fabrics.find((f) => f.id === id)!;
export const getCollection = (id: string) => collections.find((c) => c.id === id)!;
export const getPiece = (id: string) => pieces.find((p) => p.id === id);
export const getWood = (id: string) => options.woods.find((w) => w.id === id)!;
export const getFinish = (id: string) => options.finishes.find((f) => f.id === id)!;

export const fabricsByCode = (code: string) => fabrics.filter((f) => f.code === code);
export const piecesByCollection = (id: string) => pieces.filter((p) => p.collection === id);
export const piecesByCode = (code: string) =>
  pieces.filter((p) => getCollection(p.collection).code === code);

export const findCollectionBySlug = (lang: Lang, slug: string) =>
  collections.find((c) => c.slug[lang] === slug);

export const findPieceBySlug = (lang: Lang, collectionSlug: string, pieceSlug: string) => {
  const col = findCollectionBySlug(lang, collectionSlug);
  if (!col) return undefined;
  return pieces.find((p) => p.collection === col.id && p.slug[lang] === pieceSlug);
};

export const typeLabel = (type: PieceType, lang: Lang, plural = false) => {
  const t = options.types[type];
  if (lang === "tr") return plural ? t.trPlural : t.tr;
  return plural ? t.enPlural : t.en;
};

export const cmToIn = (cm: number) => Math.round((cm / 2.54) * 10) / 10;
export const kgToLb = (kg: number) => Math.round(kg * 2.20462);
