import type { GlobalConfig } from "payload";
import { L, revalidateGlobal } from "../shared";

export type SiteMode = "live" | "soon" | "maintenance";

/**
 * Sitenin açık mı, "Yakında" mı, "Bakımda" mı olduğu.
 * Ziyaretçiyi yönlendiren: site/proxy.ts · Gösterilen sayfa: app/(durum)/durum/page.tsx
 * Panele giriş yapmış kullanıcılar siteyi her durumda normal görür.
 */
export const SiteStatus: GlobalConfig = {
  slug: "site-status",
  label: L("Site durumu", "Site status"),
  admin: {
    group: L("Ayarlar", "Settings"),
    description: L(
      "Siteyi ziyaretçilere kapatıp bir \"Yakında\" ya da \"Bakımdayız\" sayfası gösterin. Panele giriş yapmış olduğunuz için siz siteyi her zamanki gibi görmeye devam edersiniz. Değişiklik birkaç saniye içinde geçerli olur.",
      "Close the site to visitors and show a Coming soon or Maintenance page. Logged-in panel users still see the full site.",
    ),
  },
  access: { read: () => true },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: "mode",
      type: "radio",
      required: true,
      defaultValue: "live",
      label: L("Ziyaretçiler ne görsün?", "What should visitors see?"),
      options: [
        { label: L("Site açık", "Site is open"), value: "live" },
        { label: L("Yakında sayfası", "Coming soon page"), value: "soon" },
        { label: L("Bakımdayız sayfası", "Maintenance page"), value: "maintenance" },
      ],
      admin: {
        layout: "vertical",
        description: L(
          "Önizleme: Yakında sayfası için /durum?onizle=yakinda, Bakımdayız sayfası için /durum?onizle=bakim adresini açın.",
          "Preview: open /durum?onizle=yakinda or /durum?onizle=bakim.",
        ),
      },
    },
    {
      name: "soon",
      type: "group",
      label: L("Yakında sayfası", "Coming soon page"),
      admin: {
        description: L(
          "Boş bıraktığınız alanlarda hazır metin kullanılır. Metinleri İngilizce yazmak için üstteki dil seçiciden English'e geçin.",
          "Empty fields use the default text.",
        ),
      },
      fields: [
        {
          name: "title",
          type: "text",
          localized: true,
          label: L("Başlık", "Heading"),
          admin: { placeholder: "Bir taht, tek bir kişi için. / A throne, made for one." },
        },
        {
          name: "message",
          type: "textarea",
          localized: true,
          label: L("Metin", "Text"),
          admin: { rows: 3, placeholder: "Her parça sahibi için, tek bir ustanın elinde yapılır. Atölyenin kapılarını çok yakında açıyoruz." },
        },
        {
          name: "launchDate",
          type: "date",
          label: L("Açılış tarihi", "Opening date"),
          admin: {
            date: { pickerAppearance: "dayOnly", displayFormat: "d MMMM yyyy" },
            description: L("İsteğe bağlı. Doldurulursa sayfada \"15 Aralık 2026'da açılıyor\" gibi görünür.", "Optional. Shown on the page."),
          },
        },
        {
          name: "showForm",
          type: "checkbox",
          defaultValue: true,
          label: L("\"Haber ver\" formunu göster", "Show the \"Notify me\" form"),
          admin: {
            description: L(
              "Ziyaretçi e-postasını bırakır; adresler Ayarlar → Açılış listesi bölümüne kaydedilir.",
              "Addresses are saved under Settings → Opening list.",
            ),
          },
        },
      ],
    },
    {
      name: "maintenance",
      type: "group",
      label: L("Bakımdayız sayfası", "Maintenance page"),
      admin: { description: L("Boş bıraktığınız alanlarda hazır metin kullanılır.", "Empty fields use the default text.") },
      fields: [
        {
          name: "title",
          type: "text",
          localized: true,
          label: L("Başlık", "Heading"),
          admin: { placeholder: "Atölyede kısa bir düzenleme yapıyoruz." },
        },
        {
          name: "message",
          type: "textarea",
          localized: true,
          label: L("Metin", "Text"),
          admin: { rows: 3, placeholder: "Site kısa süre sonra yeniden açılacak. Anlayışınız için teşekkür ederiz." },
        },
        {
          name: "returnAt",
          type: "date",
          label: L("Tahmini dönüş", "Expected return"),
          admin: {
            date: { pickerAppearance: "dayAndTime", displayFormat: "d MMMM yyyy HH:mm", timeFormat: "HH:mm" },
            description: L("İsteğe bağlı. Doldurulursa sayfada \"Tahmini dönüş: …\" olarak görünür.", "Optional. Shown on the page."),
          },
        },
      ],
    },
    {
      name: "contactEmail",
      type: "email",
      label: L("İletişim e-postası", "Contact email"),
      admin: {
        placeholder: "hi@tahtirevan.com",
        description: L("İsteğe bağlı. İki sayfanın altında da gösterilir.", "Optional. Shown on both pages."),
      },
    },
  ],
};
