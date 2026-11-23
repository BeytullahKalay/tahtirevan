import type { GlobalConfig } from "payload";
import { L, revalidateGlobal } from "../shared";

/** Ana sayfa ayarları: açılıştaki kumaşlar ve zanaat sayıları. */
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: L("Site ayarları", "Site settings"),
  admin: {
    group: L("Ayarlar", "Settings"),
    description: L("Ana sayfanın açılışındaki kumaş daireleri ve zanaat sayıları.", "The fabric circles on the home page opening and the craft numbers."),
  },
  access: { read: () => true },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: "hero",
      type: "group",
      label: L("Açılış", "Opening"),
      fields: [
        {
          name: "fabric",
          type: "relationship",
          relationTo: "fabrics",
          required: true,
          label: L("Yaklaşılan kumaş", "Zoom-in fabric"),
          admin: {
            // Açılıştaki kumaş geçişi kaldırıldı (23 Kasım 2026); değer saklanır, panelde gösterilmez.
            hidden: true,
            description: L(
              "Aşağı kaydırınca ekranı dolduran kumaş. Açılıştaki koltuk fotoğrafının sırtıyla aynı kumaş olması önerilir.",
              "The fabric that fills the screen on scroll.",
            ),
          },
        },
        {
          name: "orbs",
          type: "relationship",
          relationTo: "fabrics",
          hasMany: true,
          maxRows: 4,
          label: L("Açılıştaki kumaşlar", "Opening fabrics"),
          admin: { description: L("Ana sayfadaki altın amblemin (tahtırevanın) içini döşeyen en fazla 4 kumaş. Sırayla, 6 saniyede bir değişir; sayfa açılınca ilki görünür.", "Up to 4 fabrics that upholster the inside of the gold emblem on the home page. They change every 6 seconds, in this order; the first shows on load.") },
        },
      ],
    },
    {
      name: "studio",
      type: "group",
      label: L("Kumaş stüdyosu", "Fabric studio"),
      // Ana sayfadaki 3B kumaş stüdyosu kaldırıldı (23 Kasım 2026); değer saklanır, panelde gösterilmez.
      admin: { hidden: true },
      fields: [
        {
          name: "model",
          type: "relationship",
          relationTo: "models",
          label: L("3B koltuk", "3D chair"),
          admin: {
            description: L(
              "Ana sayfada kumaşların denendiği 3B model (Medya › 3B modeller). Boş bırakılırsa sitedeki hazır koltuk kullanılır.",
              "The 3D model on the home page fabric studio. The built-in chair is used if empty.",
            ),
          },
        },
      ],
    },
    {
      name: "craftNumbers",
      type: "array",
      label: L("Zanaat sayıları", "Craft numbers"),
      labels: { singular: L("Sayı", "Number"), plural: L("Sayılar", "Numbers") },
      maxRows: 3,
      admin: { description: L("Ana sayfada sıfırdan sayarak beliren üç sayı.", "Three numbers that count up on the home page.") },
      fields: [
        {
          type: "row",
          fields: [
            { name: "value", type: "text", required: true, label: L("Sayı", "Value"), admin: { width: "20%", placeholder: "420" } },
            { name: "label", type: "text", required: true, localized: true, label: L("Açıklama", "Label"), admin: { width: "80%" } },
          ],
        },
      ],
    },
  ],
};
