import type { GlobalConfig } from "payload";
import { L, revalidateGlobal } from "../shared";

/**
 * Reklam testinin sipariş sayfası (/siparis/gecis) için panelden değiştirilebilen bilgiler.
 * Sayfa: app/(siparis)/siparis/gecis/page.tsx · Kayıtlar: Reklam testi › Ön siparişler
 */
export const PreorderPage: GlobalConfig = {
  slug: "on-siparis-sayfasi",
  label: L("Sipariş sayfası", "Order page"),
  admin: {
    group: L("Reklam testi", "Ad test"),
    description: L(
      "Reklamın götürdüğü sayfa: tahtirevan.com/siparis/gecis. Site \"Yakında\" modundayken de açıktır. Reklamda bu adresi etiketle kullanın: tahtirevan.com/siparis/gecis?utm_source=instagram",
      "The page the ad links to: tahtirevan.com/siparis/gecis. Stays open in Coming soon mode.",
    ),
  },
  access: { read: () => true },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: "open",
      type: "checkbox",
      defaultValue: true,
      label: L("Sipariş formu açık", "Order form open"),
      admin: {
        description: L(
          "İşareti kaldırırsanız sayfa açık kalır ama \"Sipariş ver\" yerine \"Bu dönemin sırası doldu\" yazar.",
          "If unticked, the page shows that the list is full instead of the form.",
        ),
      },
    },
    {
      name: "price",
      type: "text",
      label: L("Fiyat", "Price"),
      admin: {
        placeholder: "Örnek: 120.000 TL",
        description: L(
          "Sayfada büyük yazılır. Boş bırakılırsa \"Fiyat görüşmede paylaşılır\" yazar; fiyat görünmezse test yalnızca ilgiyi ölçer.",
          "Shown large. If empty, the page says the price is shared on the call.",
        ),
      },
    },
    {
      name: "priceNote",
      type: "text",
      label: L("Fiyatın altındaki not", "Note under the price"),
      admin: { placeholder: "KDV dahil · nakliye İstanbul içinde ücretsiz" },
    },
    {
      name: "leadTime",
      type: "text",
      label: L("Teslim süresi", "Lead time"),
      defaultValue: "Yaklaşık 3 ay",
    },
  ],
};
