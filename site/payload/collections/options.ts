import type { CollectionConfig } from "payload";
import { L, keyField, protectDelete, revalidateAfterChange, revalidateAfterDelete } from "../shared";

const OPTIONS = L("Seçenekler", "Options");

/** Basit seçenek listeleri: sürükleyerek sıralanır, taslak gerektirmez. */
const option = (
  slug: string,
  singular: ReturnType<typeof L>,
  plural: ReturnType<typeof L>,
  example: string,
  description: ReturnType<typeof L>,
  extra: CollectionConfig["fields"] = [],
  refs: Parameters<typeof protectDelete>[1] = [],
): CollectionConfig => ({
  slug,
  labels: { singular, plural },
  orderable: true,
  defaultSort: "_order",
  admin: { group: OPTIONS, useAsTitle: "name", description },
  access: { read: () => true },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
    beforeDelete: refs.length ? [protectDelete(singular.tr.toLocaleLowerCase("tr"), refs)] : [],
  },
  fields: [
    { name: "name", type: "text", required: true, localized: true, label: L("Ad", "Name"), admin: { placeholder: example } },
    ...extra,
    keyField(slug === "piece-types" ? "koltuk" : "ceviz"),
  ],
});

export const PieceTypes = option(
  "piece-types",
  L("Parça türü", "Piece type"),
  L("Parça türleri", "Piece types"),
  "Koltuk",
  L("Koltuk, kanepe, sedir… Koleksiyon sayfasındaki sekmeler bu sırayla görünür.", "Armchair, sofa, daybed… Collection tabs follow this order."),
  [{ name: "plural", type: "text", required: true, localized: true, label: L("Çoğul", "Plural"), admin: { placeholder: "Koltuklar" } }],
  [
    { collection: "pieces", field: "type", label: "Parçalar" },
    { collection: "fabrics", field: "suitableFor", label: "Kumaşlar" },
  ],
);

export const Woods = option(
  "woods",
  L("Ahşap", "Wood"),
  L("Ahşaplar", "Woods"),
  "Elde oyulmuş ceviz",
  L("Gövde ahşabı seçenekleri.", "Frame wood options."),
  [],
  [
    { collection: "pieces", field: "wood", label: "Parçalar (gövde)" },
    { collection: "pieces", field: "woods", label: "Parçalar (seçenek)" },
  ],
);

export const Finishes = option(
  "finishes",
  L("Kaplama", "Finish"),
  L("Kaplamalar", "Finishes"),
  "Doğal yağ",
  L("Gövde kaplama seçenekleri.", "Frame finish options."),
  [],
  [{ collection: "pieces", field: "finish", label: "Parçalar" }],
);

export const Sizes = option(
  "sizes",
  L("Ölçü seçeneği", "Size option"),
  L("Ölçü seçenekleri", "Size options"),
  "Atölye ölçüsü",
  L("Kişiselleştirmede sunulan ölçü seçenekleri.", "Size options offered in personalisation."),
);
