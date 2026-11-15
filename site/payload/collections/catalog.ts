import type { CollectionConfig, PayloadRequest } from "payload";
import { APIError } from "payload";
import { suggestFabricColors } from "../colors";
import { L, colorsField, contentDefaults, hexField, keyField, protectDelete, slugField } from "../shared";

const CATALOG = L("Katalog", "Catalogue");

const nameField = (example: string) => ({
  name: "name",
  type: "text" as const,
  required: true,
  localized: true,
  label: L("Ad", "Name"),
  admin: { placeholder: example },
});

/* ---------- Desen kodları ---------- */

export const PatternCodes: CollectionConfig = {
  ...contentDefaults,
  slug: "pattern-codes",
  labels: { singular: L("Desen kodu", "Pattern code"), plural: L("Desen kodları", "Pattern codes") },
  defaultSort: "_order",
  admin: {
    group: CATALOG,
    useAsTitle: "name",
    defaultColumns: ["name", "leadFabric", "_status"],
    description: L(
      "Kumaşların toplandığı dünyalar (Bahçe, Fauna…). Sırayı listede sürükleyerek değiştirebilirsiniz.",
      "The worlds fabrics are grouped into. Drag rows in the list to reorder.",
    ),
  },
  fields: [
    nameField("Bahçe"),
    {
      name: "line",
      type: "textarea",
      localized: true,
      required: true,
      label: L("Tek cümle", "One line"),
      admin: { description: L("Ana sayfadaki tam ekran görselin altında görünür.", "Shown under the full-screen image on the home page.") },
    },
    {
      name: "description",
      type: "textarea",
      localized: true,
      label: L("Açıklama", "Description"),
      admin: { description: L("Desenler sayfasında, kodun karakterini anlatan iki cümle.", "Two sentences on the Patterns page.") },
    },
    {
      name: "leadFabric",
      type: "relationship",
      relationTo: "fabrics",
      label: L("Öne çıkan kumaş", "Lead fabric"),
      admin: {
        description: L("Bu kodu tam ekran temsil eden kumaş.", "The fabric shown full-screen for this code."),
      },
      filterOptions: ({ id }) => (id ? { patternCode: { equals: id } } : true),
    },
    colorsField(L("Bu kodun ışığı ve tonları.", "The light and tones of this code.")),
    keyField("bahce"),
    slugField(),
  ],
  hooks: {
    ...contentDefaults.hooks,
    beforeDelete: [
      protectDelete("desen kodu", [
        { collection: "fabrics", field: "patternCode", label: "Kumaşlar" },
        { collection: "piece-collections", field: "code", label: "Koleksiyonlar" },
      ]),
    ],
  },
};

/* ---------- Kumaşlar ---------- */

async function blockIfOnHome(req: PayloadRequest, id: string | number) {
  const s = (await req.payload.findGlobal({ slug: "site-settings", depth: 0, req })) as {
    hero?: { fabric?: number | string | null; orbs?: (number | string)[] | null };
  };
  const hit = s?.hero?.fabric == id || (s?.hero?.orbs ?? []).some((o) => o == id);
  if (hit) throw new APIError("Bu kumaş Site ayarları › Açılış bölümünde seçili; önce oradan değiştirin.", 400, null, true);
}

export const Fabrics: CollectionConfig = {
  ...contentDefaults,
  slug: "fabrics",
  labels: { singular: L("Kumaş", "Fabric"), plural: L("Kumaşlar", "Fabrics") },
  defaultSort: "_order",
  admin: {
    group: CATALOG,
    useAsTitle: "name",
    defaultColumns: ["name", "patternCode", "image", "_status"],
    description: L(
      "Yeni kumaş: görseli yükleyin, desen kodunu seçin, Yayınla'ya basın. Renkler ve oturak kadifesi boş bırakılırsa görselden önerilir.",
      "New fabric: upload the image, choose the pattern code, publish. Colours are suggested from the image if left empty.",
    ),
  },
  fields: [
    nameField("Rossaria"),
    {
      type: "row",
      fields: [
        {
          name: "patternCode",
          type: "relationship",
          relationTo: "pattern-codes",
          required: true,
          label: L("Desen kodu", "Pattern code"),
        },
        {
          name: "suitableFor",
          type: "relationship",
          relationTo: "piece-types",
          hasMany: true,
          label: L("Uygun gövdeler", "Suitable for"),
        },
      ],
    },
    {
      name: "image",
      type: "upload",
      relationTo: "fabric-images",
      required: true,
      label: L("Kumaş görseli", "Fabric image"),
    },
    {
      name: "motif",
      type: "text",
      localized: true,
      required: true,
      label: L("Motif", "Motif"),
      admin: { placeholder: "Koyu zeminde iri güller" },
    },
    {
      type: "row",
      fields: [
        { name: "colorNotes", type: "text", localized: true, label: L("Renk notları", "Colour notes"), admin: { placeholder: "Bordo, mercan, yaprak yeşili" } },
        { name: "scale", type: "text", localized: true, label: L("Ölçek", "Scale"), admin: { placeholder: "Büyük ölçek · 64 cm rapor" } },
      ],
    },
    colorsField(L("Sitede bu kumaşın ışığı. Boş bırakırsanız görselden önerilir.", "This fabric's light on the site. Suggested from the image if empty.")),
    hexField(
      "velvet",
      L("Oturak kadifesi rengi", "Seat velvet colour"),
      L("3B önizlemede oturağın rengi. Boş bırakırsanız görselden önerilir.", "Seat colour in the 3D preview. Suggested from the image if empty."),
    ),
    {
      name: "nameStatus",
      type: "select",
      defaultValue: "final",
      label: L("Ad durumu", "Name status"),
      options: [
        { label: L("Kesin", "Final"), value: "final" },
        { label: L("Geçici ad", "Provisional"), value: "provisional" },
      ],
      admin: { position: "sidebar" },
    },
    keyField("rossaria"),
  ],
  hooks: {
    ...contentDefaults.hooks,
    beforeChange: [suggestFabricColors],
    beforeDelete: [
      protectDelete("kumaş", [
        { collection: "pieces", field: "fabric", label: "Parçalar" },
        { collection: "pattern-codes", field: "leadFabric", label: "Desen kodları" },
      ]),
      async ({ req, id }) => blockIfOnHome(req, id),
    ],
  },
};

/* ---------- Koleksiyonlar ---------- */

export const PieceCollections: CollectionConfig = {
  ...contentDefaults,
  slug: "piece-collections",
  labels: { singular: L("Koleksiyon", "Collection"), plural: L("Koleksiyonlar", "Collections") },
  defaultSort: "_order",
  admin: { group: CATALOG, useAsTitle: "name", defaultColumns: ["name", "code", "featured", "_status"] },
  fields: [
    nameField("Bahçe"),
    { name: "code", type: "relationship", relationTo: "pattern-codes", required: true, label: L("Desen kodu", "Pattern code") },
    { name: "line", type: "textarea", localized: true, required: true, label: L("Tek cümle", "One line") },
    {
      name: "featured",
      type: "checkbox",
      label: L("Ana sayfada öne çıkar", "Feature on the home page"),
      admin: { position: "sidebar", description: L("Birden fazla seçilirse listede en üstteki kullanılır.", "If several are ticked, the first in the list is used.") },
    },
    keyField("bahce"),
    slugField(),
  ],
  hooks: {
    ...contentDefaults.hooks,
    beforeDelete: [protectDelete("koleksiyon", [{ collection: "pieces", field: "collection", label: "Parçalar" }])],
  },
};

/* ---------- Parçalar (ürünler) ---------- */

export const Pieces: CollectionConfig = {
  ...contentDefaults,
  slug: "pieces",
  labels: { singular: L("Parça", "Piece"), plural: L("Parçalar", "Pieces") },
  defaultSort: "_order",
  admin: {
    group: CATALOG,
    useAsTitle: "name",
    defaultColumns: ["name", "collection", "type", "fabric", "_status"],
    description: L(
      "Yeni ürün: adı, koleksiyonu, türü ve kumaşı seçin; fotoğraf yoksa geçici koltuk fotoğrafı kullanılır. Taslak olarak kaydedip hazır olunca Yayınla'ya basın.",
      "New product: name, collection, type and fabric. Save as draft, publish when ready.",
    ),
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: L("Genel", "General"),
          fields: [
            nameField("Serir"),
            {
              type: "row",
              fields: [
                { name: "collection", type: "relationship", relationTo: "piece-collections", required: true, label: L("Koleksiyon", "Collection") },
                { name: "type", type: "relationship", relationTo: "piece-types", required: true, label: L("Tür", "Type") },
                { name: "fabric", type: "relationship", relationTo: "fabrics", required: true, label: L("Kumaş", "Fabric") },
              ],
            },
            {
              name: "story",
              type: "textarea",
              localized: true,
              required: true,
              label: L("Parçanın hikâyesi", "The story"),
              admin: { rows: 5 },
            },
            {
              name: "techniques",
              type: "array",
              label: L("El teknikleri", "Hand techniques"),
              labels: { singular: L("Teknik", "Technique"), plural: L("Teknikler", "Techniques") },
              minRows: 1,
              fields: [{ name: "text", type: "text", localized: true, required: true, label: L("Teknik", "Technique") }],
            },
          ],
        },
        {
          label: L("Görsel ve 3B", "Image and 3D"),
          fields: [
            {
              name: "photo",
              type: "upload",
              relationTo: "media",
              label: L("Ürün fotoğrafı", "Product photo"),
              admin: {
                description: L(
                  "Arka planı temizlenmiş PNG önerilir. Boş bırakılırsa geçici koltuk fotoğrafı gösterilir.",
                  "A transparent PNG is recommended. The temporary chair photo is used if empty.",
                ),
              },
            },
            {
              name: "model",
              type: "upload",
              relationTo: "models",
              label: L("3B model (.glb)", "3D model (.glb)"),
              admin: {
                description: L(
                  "İsteğe bağlı. Yapay zekâdan çıkan .glb'yi buradan da yükleyebilirsiniz; kumaş, kadife ve metal kendiliğinden ayrılır. Boşsa sitedeki hazır koltuk kullanılır.",
                  "Optional. Upload the AI-generated .glb here; parts are separated automatically. The built-in chair is used if empty.",
                ),
              },
            },
          ],
        },
        {
          label: L("Malzeme", "Materials"),
          fields: [
            {
              type: "row",
              fields: [
                { name: "wood", type: "relationship", relationTo: "woods", required: true, label: L("Gövde ahşabı", "Frame wood") },
                { name: "finish", type: "relationship", relationTo: "finishes", required: true, label: L("Kaplama", "Finish") },
              ],
            },
            {
              name: "woods",
              type: "relationship",
              relationTo: "woods",
              hasMany: true,
              label: L("Seçilebilir ahşaplar", "Available woods"),
              admin: { description: L("Kişiselleştirmede sunulacak ahşaplar. Gövde ahşabı kendiliğinden eklenir.", "Woods offered in personalisation.") },
            },
          ],
        },
        {
          label: L("Ölçü ve üretim", "Size and making"),
          fields: [
            {
              name: "dims",
              type: "group",
              label: L("Ölçüler (cm)", "Dimensions (cm)"),
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "w", type: "number", required: true, min: 1, label: L("Genişlik", "Width") },
                    { name: "d", type: "number", required: true, min: 1, label: L("Derinlik", "Depth") },
                    { name: "h", type: "number", required: true, min: 1, label: L("Yükseklik", "Height") },
                    { name: "seat", type: "number", required: true, min: 1, label: L("Oturma yüksekliği", "Seat height") },
                  ],
                },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "weightKg", type: "number", required: true, min: 0, label: L("Ağırlık (kg)", "Weight (kg)") },
                { name: "hours", type: "number", required: true, min: 0, label: L("İşçilik (saat)", "Handwork (hours)") },
              ],
            },
            {
              name: "leadWeeks",
              type: "group",
              label: L("Teslim süresi (hafta)", "Lead time (weeks)"),
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "min", type: "number", required: true, min: 1, label: L("En az", "From") },
                    { name: "max", type: "number", required: true, min: 1, label: L("En çok", "To") },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "featured",
      type: "checkbox",
      label: L("Öne çıkan", "Featured"),
      admin: { position: "sidebar" },
    },
    keyField("serir"),
    slugField(),
  ],
  hooks: {
    ...contentDefaults.hooks,
    beforeValidate: [
      ({ data }) => {
        // Gövde ahşabı seçilebilir ahşaplarda yoksa ekle
        if (data?.wood) {
          const woods = (data.woods ?? []) as (number | string | { id: number | string })[];
          const ids = woods.map((w) => (typeof w === "object" ? w.id : w));
          const wood = typeof data.wood === "object" ? data.wood.id : data.wood;
          if (!ids.includes(wood)) data.woods = [...woods, wood];
        }
        return data;
      },
    ],
  },
};
