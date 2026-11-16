/**
 * Mevcut içeriği (content/*.json ve public/ görselleri) admin paneline aktarır.
 * Tekrar çalıştırılabilir: kayıtlar `key` ile bulunur ve güncellenir, çoğaltılmaz.
 *
 *   npm run seed
 */
import fs from "node:fs";
import path from "node:path";
import { getPayload, type CollectionSlug } from "payload";
import config from "../payload.config";

type Loc = { tr: string; en: string };
const ROOT = process.cwd();
const json = <T>(name: string): T => JSON.parse(fs.readFileSync(path.join(ROOT, "content", name), "utf8"));

// Eskiden koda gömülüydü (lib/media.ts); artık kumaş ve desen kodu alanları.
const VELVET: Record<string, string> = {
  rossaria: "#6e1a24", colibri: "#1d4a3a", sahara: "#7a3a1c", ardente: "#4a2416", panthera: "#5e1a1f", mayura: "#163845",
  soraya: "#5a2318", mirza: "#4a2e1c", zafran: "#7a2e14", sapphire: "#142a4e", simur: "#1d3f33",
};
const LEAD: Record<string, string> = { bahce: "rossaria", fauna: "mayura", susleme: "soraya", ruya: "simur" };

const ctx = { skipRevalidate: true };

async function main() {
  const payload = await getPayload({ config });
  // Koleksiyonlar arası ortak yardımcılar için tipler gevşek tutulur (tek seferlik aktarma betiği).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = payload as any;
  const log = (...a: unknown[]) => console.log("  ·", ...a);

  /** key ile bul; varsa TR'yi güncelle, yoksa oluştur; ardından EN'i yaz. */
  async function upsert(
    collection: CollectionSlug,
    key: string,
    trData: Record<string, unknown>,
    enData: (doc: Record<string, unknown>) => Record<string, unknown>,
    publish = true,
  ) {
    const found = await db.find({ collection, where: { key: { equals: key } }, limit: 1, depth: 0, draft: true, context: ctx });
    const status = publish ? { _status: "published" } : {};
    const data = { key, ...trData, ...status };
    const doc = found.docs[0]
      ? await db.update({ collection, id: found.docs[0].id, data, locale: "tr", depth: 0, context: ctx })
      : await db.create({ collection, data, locale: "tr", depth: 0, context: ctx });
    const en = await db.update({
      collection,
      id: doc.id,
      data: { ...enData(doc as unknown as Record<string, unknown>), ...status },
      locale: "en",
      depth: 0,
      context: ctx,
    });
    return en as unknown as { id: number; [k: string]: unknown };
  }

  /** Dosya adına göre bir kez yükler. */
  async function uploadOnce(collection: CollectionSlug, file: string, alt: Loc) {
    const filename = path.basename(file);
    const found = await db.find({ collection, where: { filename: { equals: filename } }, limit: 1, depth: 0 });
    if (found.docs[0]) return found.docs[0] as { id: number };
    const doc = await db.create({ collection, data: { alt: alt.tr }, filePath: file, locale: "tr", context: ctx });
    await db.update({ collection, id: doc.id, data: { alt: alt.en }, locale: "en", context: ctx });
    return doc as { id: number };
  }

  /** Dizi alanındaki yerelleştirilmiş metinleri EN için satır kimlikleriyle eşler. */
  const rowsEn = <T extends Record<string, unknown>>(rows: unknown, en: T[]) =>
    ((rows as { id: string }[]) ?? []).map((r, i) => ({ ...r, ...en[i] }));

  console.log("Seçenekler");
  const options = json<{
    woods: { id: string; tr: string; en: string }[];
    finishes: { id: string; tr: string; en: string }[];
    sizes: { id: string; tr: string; en: string }[];
    types: Record<string, { tr: string; en: string; trPlural: string; enPlural: string }>;
  }>("options.json");
  const typeId: Record<string, number> = {};
  for (const [key, t] of Object.entries(options.types)) {
    const d = await upsert("piece-types", key, { name: t.tr, plural: t.trPlural }, () => ({ name: t.en, plural: t.enPlural }), false);
    typeId[key] = d.id;
  }
  const woodId: Record<string, number> = {};
  for (const w of options.woods) woodId[w.id] = (await upsert("woods", w.id, { name: w.tr }, () => ({ name: w.en }), false)).id;
  const finishId: Record<string, number> = {};
  for (const f of options.finishes) finishId[f.id] = (await upsert("finishes", f.id, { name: f.tr }, () => ({ name: f.en }), false)).id;
  for (const s of options.sizes) await upsert("sizes", s.id, { name: s.tr }, () => ({ name: s.en }), false);
  log(`${Object.keys(typeId).length} tür, ${options.woods.length} ahşap, ${options.finishes.length} kaplama, ${options.sizes.length} ölçü`);

  console.log("Desen kodları");
  const codes = json<{ id: string; order: number; slug: Loc; name: Loc; line: Loc; description: Loc; colors: string[] }[]>(
    "patternCodes.json",
  ).sort((a, b) => a.order - b.order);
  const codeId: Record<string, number> = {};
  for (const c of codes) {
    const d = await upsert(
      "pattern-codes",
      c.id,
      { name: c.name.tr, slug: c.slug.tr, line: c.line.tr, description: c.description.tr, colors: c.colors.map((color) => ({ color })) },
      () => ({ name: c.name.en, slug: c.slug.en, line: c.line.en, description: c.description.en }),
    );
    codeId[c.id] = d.id;
  }
  log(codes.map((c) => c.id).join(", "));

  console.log("Kumaşlar (görseller yükleniyor, küçük sürümler üretiliyor)");
  const fabrics = json<
    { id: string; name: string; nameStatus?: string; code: string; colors: string[]; colorNotes: Loc; motif: Loc; scale: Loc; suitableFor: string[] }[]
  >("fabrics.json");
  const fabricId: Record<string, number> = {};
  for (const f of fabrics) {
    const img = await uploadOnce("fabric-images", path.join(ROOT, "public", "fabrics", `${f.id}.jpg`), { tr: `${f.name} kumaşı`, en: `${f.name} fabric` });
    const d = await upsert(
      "fabrics",
      f.id,
      {
        name: f.name,
        nameStatus: f.nameStatus === "provisional" ? "provisional" : "final",
        patternCode: codeId[f.code],
        image: img.id,
        suitableFor: f.suitableFor.map((t) => typeId[t]),
        motif: f.motif.tr,
        colorNotes: f.colorNotes.tr,
        scale: f.scale.tr,
        colors: f.colors.map((color) => ({ color })),
        velvet: VELVET[f.id],
      },
      () => ({ name: f.name, motif: f.motif.en, colorNotes: f.colorNotes.en, scale: f.scale.en }),
    );
    fabricId[f.id] = d.id;
    log(f.name);
  }
  for (const c of codes) {
    await payload.update({ collection: "pattern-codes", id: codeId[c.id], data: { leadFabric: fabricId[LEAD[c.id]] }, context: ctx });
  }

  console.log("Koleksiyonlar");
  const cols = json<{ id: string; code: string; featured?: boolean; slug: Loc; name: Loc; line: Loc }[]>("collections.json");
  const colId: Record<string, number> = {};
  for (const c of cols) {
    const d = await upsert(
      "piece-collections",
      c.id,
      { name: c.name.tr, slug: c.slug.tr, line: c.line.tr, code: codeId[c.code], featured: Boolean(c.featured) },
      () => ({ name: c.name.en, slug: c.slug.en, line: c.line.en }),
    );
    colId[c.id] = d.id;
  }
  log(cols.map((c) => c.id).join(", "));

  console.log("Parçalar");
  const serirPhoto = await uploadOnce("media", path.join(ROOT, "public", "chair", "serir-hd.png"), {
    tr: "Serir koltuk, Rossaria sırt ve kadife oturak",
    en: "Serir armchair, Rossaria back and velvet seat",
  });
  const pieces = json<
    {
      id: string; collection: string; type: string; featured?: boolean; slug: Loc; name: string; story: Loc; fabric: string; wood: string;
      finish: string; woods: string[]; dims: { w: number; d: number; h: number; seat: number }; weightKg: number; hours: number;
      leadWeeks: [number, number]; techniques: Loc[];
    }[]
  >("pieces.json");
  for (const p of pieces) {
    await upsert(
      "pieces",
      p.id,
      {
        name: p.name,
        slug: p.slug.tr,
        collection: colId[p.collection],
        type: typeId[p.type],
        featured: Boolean(p.featured),
        story: p.story.tr,
        fabric: fabricId[p.fabric],
        wood: woodId[p.wood],
        finish: finishId[p.finish],
        woods: p.woods.map((w) => woodId[w]),
        dims: p.dims,
        weightKg: p.weightKg,
        hours: p.hours,
        leadWeeks: { min: p.leadWeeks[0], max: p.leadWeeks[1] },
        techniques: p.techniques.map((t) => ({ text: t.tr })),
        ...(p.id === "serir" ? { photo: serirPhoto.id } : {}),
      },
      (doc) => ({ name: p.name, slug: p.slug.en, story: p.story.en, techniques: rowsEn(doc.techniques, p.techniques.map((t) => ({ text: t.en }))) }),
    );
    log(p.name);
  }

  console.log("Site ayarları");
  const site = json<{ hero: { fabric: string; orbs: string[] }; craftNumbers: { value: string; tr: string; en: string }[] }>("site.json");
  const s = await payload.updateGlobal({
    slug: "site-settings",
    locale: "tr",
    data: {
      hero: { fabric: fabricId[site.hero.fabric], orbs: site.hero.orbs.map((o) => fabricId[o]) },
      craftNumbers: site.craftNumbers.map((n) => ({ value: n.value, label: n.tr })),
    },
    context: ctx,
  });
  await payload.updateGlobal({
    slug: "site-settings",
    locale: "en",
    data: { craftNumbers: rowsEn(s.craftNumbers, site.craftNumbers.map((n) => ({ label: n.en }))) },
    context: ctx,
  });

  const count = async (c: CollectionSlug) => (await payload.count({ collection: c })).totalDocs;
  console.log(
    `\nTamam: ${await count("pieces")} parça, ${await count("fabrics")} kumaş, ${await count("piece-collections")} koleksiyon, ${await count("pattern-codes")} desen kodu, ${await count("fabric-images")} kumaş görseli.`,
  );
  process.exit(0);
}

// `payload run` betiği içe aktarıp hemen çıkar; bu yüzden işin bitmesi üst seviyede beklenir.
try {
  await main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
