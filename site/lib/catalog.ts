/**
 * Katalog tipleri ve yardımcıları. Veri İÇERMEZ: veri sunucuda `getCatalog()` ile yüklenir
 * (lib/catalog.server.ts), tarayıcıdaki bileşenlere `CatalogProvider` ile aktarılır.
 * Hem sunucu hem tarayıcı bileşenleri bu dosyayı kullanabilir.
 */
import type { Lang, SlugMap } from "./i18n";

export type Localized = { tr: string; en: string };
/** Parça türü anahtarı (panelde "Parça türleri": koltuk, kanepe, sedir…). */
export type PieceType = string;

/** Çözülmüş görsel: adres + boyut (Next/Image için). */
export type Img = { src: string; width: number; height: number; alt?: Localized };

export type PatternCode = {
  id: string;
  order: number;
  slug: Localized;
  name: Localized;
  line: Localized;
  description: Localized;
  colors: string[];
  /** Bu kodu temsil eden kumaş (açılışlar, tam ekran görseller). */
  lead: string;
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
  /** 3B önizlemede oturak kadifesinin rengi. */
  velvet: string;
  /** Büyük, duyarlı kullanım için kaynak görsel. */
  image: Img;
  /** Hazır küçük sürümler (doğrudan sunulur). */
  tex: string;
  swatch: string;
  tile: string;
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
  /** Koleksiyonun bağlantı parçası; adres üretmek için parçayla birlikte taşınır. */
  colSlug: Localized;
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
  /** Parçanın kendi ürün fotoğrafı (arka planı temiz PNG önerilir). Yoksa geçici koltuk fotoğrafı. */
  photo?: Img;
  /** Parçanın kendi 3B modeli (GLB). Yoksa kodla çizilen koltuk. */
  model?: string;
};

export type Option = { id: string; tr: string; en: string };

export type Options = {
  woods: Option[];
  finishes: Option[];
  sizes: Option[];
  types: Record<PieceType, { tr: string; en: string; trPlural: string; enPlural: string }>;
  /** Türlerin paneldeki sırası (koleksiyon sekmeleri bu sırayla). */
  typeOrder: PieceType[];
};

export type SiteSettings = {
  hero: {
    /** Açılışta yaklaşılan ve tam ekrana açılan kumaş. */
    fabric: string;
    /** Açılışta koltuğun çevresinde süzülen kumaşlar (en fazla 4). */
    orbs: string[];
  };
  craftNumbers: { value: string; tr: string; en: string }[];
};

/** Tarayıcıya giden, düz (serileştirilebilir) katalog verisi. */
export type CatalogData = {
  codes: PatternCode[];
  fabrics: Fabric[];
  collections: Collection[];
  pieces: Piece[];
  options: Options;
  site: SiteSettings;
};

/** Veriye bağlı yardımcılar. Sunucuda `await getCatalog()`, tarayıcıda `useCatalog()` bunları döndürür. */
export function withHelpers(data: CatalogData) {
  const { codes, fabrics, collections, pieces, options } = data;
  const getCode = (id: string) => codes.find((c) => c.id === id) ?? codes[0];
  const getFabric = (id: string) => fabrics.find((f) => f.id === id) ?? fabrics[0];
  const getCollection = (id: string) => collections.find((c) => c.id === id) ?? collections[0];
  const getPiece = (id: string) => pieces.find((p) => p.id === id);
  const findCollectionBySlug = (lang: Lang, slug: string) => collections.find((c) => c.slug[lang] === slug);

  return {
    ...data,
    getCode,
    getFabric,
    getCollection,
    getPiece,
    getWood: (id: string) => options.woods.find((w) => w.id === id) ?? options.woods[0],
    getFinish: (id: string) => options.finishes.find((f) => f.id === id) ?? options.finishes[0],
    fabricsByCode: (code: string) => fabrics.filter((f) => f.code === code),
    piecesByCollection: (id: string) => pieces.filter((p) => p.collection === id),
    piecesByCode: (code: string) => pieces.filter((p) => getCollection(p.collection).code === code),
    findCollectionBySlug,
    findPieceBySlug: (lang: Lang, collectionSlug: string, pieceSlug: string) => {
      const col = findCollectionBySlug(lang, collectionSlug);
      if (!col) return undefined;
      return pieces.find((p) => p.collection === col.id && p.slug[lang] === pieceSlug);
    },
    typeLabel: (type: PieceType, lang: Lang, plural = false) => {
      const t = options.types[type] ?? { tr: type, en: type, trPlural: type, enPlural: type };
      if (lang === "tr") return plural ? t.trPlural : t.tr;
      return plural ? t.enPlural : t.en;
    },
    slugs: {
      collections: collections.map((c) => ({ id: c.id, slug: c.slug })),
      pieces: pieces.map((p) => ({ collection: p.collection, slug: p.slug })),
    } satisfies SlugMap,
  };
}

export type Catalog = ReturnType<typeof withHelpers>;

export const cmToIn = (cm: number) => Math.round((cm / 2.54) * 10) / 10;
export const kgToLb = (kg: number) => Math.round(kg * 2.20462);
