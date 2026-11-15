/**
 * Kataloğun tek giriş noktası (yalnızca sunucuda). Veri admin panelinden (Payload, /admin) gelir.
 * Sayfalar ve sunucu bileşenleri `await getCatalog()` çağırır; tarayıcıya `getCatalogData()`
 * sonucu CatalogProvider ile geçer.
 *
 * Yalnızca YAYINDAKİ kayıtlar okunur. Bağlantısı eksik kayıtlar (ör. kumaşı yayında olmayan parça)
 * siteyi bozmasın diye atlanır.
 */
import config from "@payload-config";
import { getPayload, type CollectionSlug } from "payload";
import { cache } from "react";
import {
  withHelpers,
  type CatalogData,
  type Collection,
  type Fabric,
  type Img,
  type Localized,
  type Option,
  type Options,
  type PatternCode,
  type Piece,
  type SiteSettings,
} from "./catalog";

type Doc = Record<string, unknown> & { id: number };

/** `locale: "all"` ile gelen yerelleştirilmiş alan → { tr, en } (eksik dil diğerinden doldurulur). */
function loc(v: unknown): Localized {
  if (v && typeof v === "object") {
    const o = v as Record<string, string | null | undefined>;
    const tr = o.tr || o.en || "";
    return { tr, en: o.en || tr };
  }
  const s = typeof v === "string" ? v : "";
  return { tr: s, en: s };
}
const id = (v: unknown) => (v && typeof v === "object" ? (v as Doc).id : (v as number | null | undefined));
const colorsOf = (v: unknown) => ((v as { color?: string }[] | null) ?? []).map((c) => c.color).filter((c): c is string => !!c);

async function load(): Promise<CatalogData> {
  const payload = await getPayload({ config });
  const published = { _status: { equals: "published" } } as const;

  const all = async (collection: CollectionSlug, opts: { published?: boolean; sort?: string } = {}) =>
    (
      await payload.find({
        collection,
        locale: "all",
        depth: 0,
        pagination: false,
        draft: false,
        sort: opts.sort,
        ...(opts.published ? { where: published } : {}),
      })
    ).docs as unknown as Doc[];

  const [codesD, fabricsD, colsD, piecesD, typesD, woodsD, finishesD, sizesD, fimgD, mediaD, modelsD, siteD, statusD] = await Promise.all([
    all("pattern-codes", { published: true, sort: "_order" }),
    all("fabrics", { published: true, sort: "_order" }),
    all("piece-collections", { published: true, sort: "_order" }),
    all("pieces", { published: true, sort: "_order" }),
    all("piece-types", { sort: "_order" }),
    all("woods", { sort: "_order" }),
    all("finishes", { sort: "_order" }),
    all("sizes", { sort: "_order" }),
    all("fabric-images"),
    all("media"),
    all("models"),
    payload.findGlobal({ slug: "site-settings", locale: "all", depth: 0 }) as unknown as Promise<Doc>,
    payload.findGlobal({ slug: "site-status", depth: 0 }) as unknown as Promise<Doc>,
  ]);

  const keyOf = (docs: Doc[]) => new Map(docs.map((d) => [d.id, d.key as string]));
  const byId = <T extends Doc>(docs: T[]) => new Map(docs.map((d) => [d.id, d]));
  const typeKey = keyOf(typesD);
  const woodKey = keyOf(woodsD);
  const finishKey = keyOf(finishesD);
  const fimg = byId(fimgD);
  const media = byId(mediaD);
  const models = byId(modelsD);
  /** 3B modelin adresi; `?v=` model her yeniden hazırlandığında değişir, tarayıcı eskisini göstermez. */
  const modelUrl = (v: unknown) => {
    const m = models.get(id(v) as number);
    const url = m?.url as string | undefined;
    return url ? `${url}?v=${encodeURIComponent(String(m?.updatedAt ?? ""))}` : undefined;
  };

  const option = (d: Doc): Option => {
    const n = loc(d.name);
    return { id: d.key as string, tr: n.tr, en: n.en };
  };
  const options: Options = {
    woods: woodsD.map(option),
    finishes: finishesD.map(option),
    sizes: sizesD.map(option),
    types: Object.fromEntries(
      typesD.map((t) => {
        const n = loc(t.name);
        const p = loc(t.plural);
        return [t.key as string, { tr: n.tr, en: n.en, trPlural: p.tr, enPlural: p.en }];
      }),
    ),
    typeOrder: typesD.map((t) => t.key as string),
  };

  // Kumaşlar: görseli ve desen kodu yayında olanlar
  const codeKeyAll = keyOf(codesD);
  const fabrics: Fabric[] = fabricsD.flatMap((f) => {
    const img = fimg.get(id(f.image) as number);
    const code = codeKeyAll.get(id(f.patternCode) as number);
    if (!img || !code) return [];
    const sizes = (img.sizes ?? {}) as Record<string, { url?: string | null } | undefined>;
    const url = img.url as string;
    const colors = colorsOf(f.colors);
    return [
      {
        id: f.key as string,
        name: loc(f.name).tr,
        nameStatus: f.nameStatus === "provisional" ? "provisional" : undefined,
        code,
        colors: colors.length ? colors : ["#3a2c22"],
        colorNotes: loc(f.colorNotes),
        motif: loc(f.motif),
        scale: loc(f.scale),
        suitableFor: ((f.suitableFor as unknown[]) ?? []).map((t) => typeKey.get(id(t) as number)).filter((t): t is string => !!t),
        velvet: (f.velvet as string) || colors[0] || "#3a2c22",
        image: { src: url, width: (img.width as number) ?? 1000, height: (img.height as number) ?? 1000, alt: loc(img.alt) },
        tex: sizes.tex?.url || url,
        swatch: sizes.swatch?.url || url,
        tile: sizes.tile?.url || url,
      },
    ];
  });
  const fabricKey = new Map(fabricsD.map((f) => [f.id, f.key as string]));
  const liveFabric = new Set(fabrics.map((f) => f.id));

  const codes: PatternCode[] = codesD.map((c, i) => {
    const key = c.key as string;
    const lead = fabricKey.get(id(c.leadFabric) as number);
    return {
      id: key,
      order: i + 1,
      slug: loc(c.slug),
      name: loc(c.name),
      line: loc(c.line),
      description: loc(c.description),
      colors: colorsOf(c.colors),
      lead: lead && liveFabric.has(lead) ? lead : (fabrics.find((f) => f.code === key)?.id ?? fabrics[0]?.id ?? ""),
    };
  });

  const collections: Collection[] = colsD.flatMap((c) => {
    const code = codeKeyAll.get(id(c.code) as number);
    if (!code) return [];
    return [{ id: c.key as string, code, featured: Boolean(c.featured), slug: loc(c.slug), name: loc(c.name), line: loc(c.line) }];
  });
  const colByDbId = new Map(colsD.map((c) => [c.id, collections.find((x) => x.id === c.key)]));

  const imgOf = (doc: Doc | undefined): Img | undefined =>
    doc?.url ? { src: doc.url as string, width: (doc.width as number) ?? 1000, height: (doc.height as number) ?? 1000, alt: loc(doc.alt) } : undefined;

  const pieces: Piece[] = piecesD.flatMap((p) => {
    const col = colByDbId.get(id(p.collection) as number);
    const fabric = fabricKey.get(id(p.fabric) as number);
    const type = typeKey.get(id(p.type) as number);
    if (!col || !fabric || !liveFabric.has(fabric) || !type) return [];
    const dims = (p.dims ?? {}) as Piece["dims"];
    const lead = (p.leadWeeks ?? {}) as { min?: number; max?: number };
    return [
      {
        id: p.key as string,
        collection: col.id,
        colSlug: col.slug,
        type,
        featured: Boolean(p.featured),
        slug: loc(p.slug),
        name: loc(p.name).tr,
        story: loc(p.story),
        fabric,
        wood: woodKey.get(id(p.wood) as number) ?? options.woods[0]?.id ?? "",
        finish: finishKey.get(id(p.finish) as number) ?? options.finishes[0]?.id ?? "",
        woods: ((p.woods as unknown[]) ?? []).map((w) => woodKey.get(id(w) as number)).filter((w): w is string => !!w),
        dims,
        weightKg: (p.weightKg as number) ?? 0,
        hours: (p.hours as number) ?? 0,
        leadWeeks: [lead.min ?? 0, lead.max ?? 0],
        techniques: ((p.techniques as { text: unknown }[]) ?? []).map((t) => loc(t.text)),
        photo: imgOf(media.get(id(p.photo) as number)),
        model: modelUrl(p.model),
      },
    ];
  });

  const hero = (siteD.hero ?? {}) as { fabric?: unknown; orbs?: unknown[] };
  const live = (v: unknown) => {
    const k = fabricKey.get(id(v) as number);
    return k && liveFabric.has(k) ? k : undefined;
  };
  const mode = statusD?.mode;
  const site: SiteSettings = {
    mode: mode === "soon" || mode === "maintenance" ? mode : "live",
    hero: {
      fabric: live(hero.fabric) ?? codes[0]?.lead ?? fabrics[0]?.id ?? "",
      orbs: (hero.orbs ?? []).map(live).filter((k): k is string => !!k),
    },
    studioModel: modelUrl((siteD.studio as { model?: unknown } | undefined)?.model),
    craftNumbers: ((siteD.craftNumbers as { value: string; label: unknown }[]) ?? []).map((n) => {
      const l = loc(n.label);
      return { value: n.value, tr: l.tr, en: l.en };
    }),
  };

  return { codes, fabrics, collections, pieces, options, site };
}

/** İstek başına bir kez yüklenir. */
export const getCatalogData = cache(load);
export const getCatalog = cache(async () => withHelpers(await getCatalogData()));
