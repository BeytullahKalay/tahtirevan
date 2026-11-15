/**
 * Admin paneli (Payload) için ortak alanlar ve kancalar.
 * Etiketler { tr, en } biçiminde: panel Türkçe açılır, İngilizce seçilebilir.
 */
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  CollectionSlug,
  Field,
  GlobalAfterChangeHook,
  PayloadRequest,
  Where,
} from "payload";
import { APIError } from "payload";

export const L = (tr: string, en: string) => ({ tr, en });

/** Türkçe karakterleri sadeleştirip adres parçası üretir: "Köşk Sedir" → "kosk-sedir". */
export function slugify(input: string) {
  const map: Record<string, string> = { ç: "c", ğ: "g", ı: "i", i̇: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };
  return input
    .toLocaleLowerCase("tr")
    .replace(/[çğıöşüâîû]|i̇/g, (ch) => map[ch] ?? ch)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const nameOf = (data: Record<string, unknown> | undefined, locale?: string) => {
  const n = data?.name;
  if (typeof n === "string") return n;
  if (n && typeof n === "object") return (n as Record<string, string>)[locale ?? "tr"] ?? (n as Record<string, string>).tr ?? "";
  return "";
};

/** Kalıcı kod adı: adreslerde değil, kayıtları birbirine bağlarken kullanılır. Boşsa addan üretilir. */
export const keyField = (example: string): Field => ({
  name: "key",
  type: "text",
  required: true,
  unique: true,
  index: true,
  label: L("Kod adı", "Key"),
  admin: {
    position: "sidebar",
    description: L(
      `Kalıcı, Türkçe karaktersiz ad (ör. ${example}). Boş bırakırsanız addan üretilir. Yayına girdikten sonra değiştirmeyin.`,
      `Permanent ASCII name (e.g. ${example}). Generated from the name if left empty. Do not change once published.`,
    ),
  },
  hooks: {
    beforeValidate: [({ value, data, originalDoc, req }) => value || originalDoc?.key || slugify(nameOf(data, req.locale ?? undefined))],
  },
});

/** Dile göre adres parçası (koleksiyon ve parça sayfaları). Boşsa o dildeki addan üretilir. */
export const slugField = (): Field => ({
  name: "slug",
  type: "text",
  localized: true,
  label: L("Adres parçası", "URL slug"),
  admin: {
    position: "sidebar",
    description: L(
      "Sayfa adresindeki kısım, her dil için ayrı (ör. serir-koltuk / serir-armchair). Boş bırakırsanız addan üretilir.",
      "The part of the page address, per language. Generated from the name if left empty.",
    ),
  },
  hooks: {
    beforeValidate: [({ value, data, req }) => (value ? slugify(String(value)) : slugify(nameOf(data, req.locale ?? undefined)))],
  },
});

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Tek renk (#rrggbb). */
export const hexField = (name: string, label: ReturnType<typeof L>, description?: ReturnType<typeof L>, required = false): Field => ({
  name,
  type: "text",
  required,
  label,
  admin: { description, placeholder: "#6e1a24" },
  validate: (v: unknown) => (!v && !required) || (typeof v === "string" && HEX.test(v)) || "Renk #rrggbb biçiminde olmalı (ör. #6e1a24).",
});

/** Renk listesi: arayüzde ışık ve tonlar bu renklerden gelir. */
export const colorsField = (description: ReturnType<typeof L>): Field => ({
  name: "colors",
  type: "array",
  label: L("Renkler", "Colours"),
  labels: { singular: L("Renk", "Colour"), plural: L("Renkler", "Colours") },
  admin: { description, initCollapsed: true },
  fields: [hexField("color", L("Renk", "Colour"), undefined, true)],
});

/* ---------- Siteyi yenileme ---------- */

async function refreshSite(req: PayloadRequest, context: Record<string, unknown>) {
  if (context?.skipRevalidate) return;
  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/", "layout");
  } catch {
    // Next dışında (ör. aktarma betiği) çalışırken yenilenecek sayfa yok.
  }
  req.payload.logger.info("Site içeriği yenilendi");
}

export const revalidateAfterChange: CollectionAfterChangeHook = async ({ doc, req, context }) => {
  await refreshSite(req, context);
  return doc;
};
export const revalidateAfterDelete: CollectionAfterDeleteHook = async ({ doc, req, context }) => {
  await refreshSite(req, context);
  return doc;
};
export const revalidateGlobal: GlobalAfterChangeHook = async ({ doc, req, context }) => {
  await refreshSite(req, context);
  return doc;
};

/* ---------- Kullanımdaki kaydı silmeyi engelle ---------- */

type Ref = { collection: CollectionSlug; field: string; label: string };

/** Silinmek istenen kayıt başka kayıtlarda kullanılıyorsa açık bir uyarıyla durdurur. */
export const protectDelete =
  (what: string, refs: Ref[]) =>
  async ({ req, id }: { req: PayloadRequest; id: string | number }) => {
    const blockers: string[] = [];
    for (const r of refs) {
      const where: Where = { [r.field]: { equals: id } };
      const res = await req.payload.find({ collection: r.collection, where, limit: 5, depth: 0, req, draft: true });
      if (res.totalDocs) {
        const names = res.docs.map((d) => {
          const n = (d as { name?: unknown; key?: string }).name;
          return typeof n === "string" ? n : ((d as { key?: string }).key ?? String(d.id));
        });
        blockers.push(`${r.label}: ${names.join(", ")}${res.totalDocs > names.length ? " …" : ""}`);
      }
    }
    if (blockers.length)
      throw new APIError(`Bu ${what} hâlâ kullanılıyor, önce bunları değiştirin — ${blockers.join(" · ")}`, 400, null, true);
  };

/** Giriş yapmamış ziyaretçi (API üzerinden) yalnızca yayındaki kayıtları görür; taslaklar panelde kalır. */
export const readPublished = ({ req }: { req: PayloadRequest }) =>
  req.user ? true : ({ _status: { equals: "published" } } as Where);

/** Sürükle-bırak sıralı, taslak/yayın destekli içerik koleksiyonlarının ortak ayarları. */
export const contentDefaults: Required<Pick<CollectionConfig, "orderable" | "versions" | "access">> & {
  hooks: { afterChange: CollectionAfterChangeHook[]; afterDelete: CollectionAfterDeleteHook[] };
} = {
  orderable: true,
  versions: { drafts: true, maxPerDoc: 20 },
  access: { read: readPublished },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
};
