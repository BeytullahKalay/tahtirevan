import type { CollectionConfig } from "payload";
import { L } from "../shared";

const csvCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

/**
 * "Yakında" sayfasındaki "Haber ver" formundan bırakılan e-postalar.
 * Kayıt yalnızca sunucudan (app/api/acilis-listesi) eklenir; panelden okunur, silinir, CSV indirilir.
 */
export const Signups: CollectionConfig = {
  slug: "signups",
  labels: { singular: L("Açılış listesi kaydı", "Opening list entry"), plural: L("Açılış listesi", "Opening list") },
  admin: {
    group: L("Ayarlar", "Settings"),
    useAsTitle: "email",
    defaultColumns: ["email", "lang", "createdAt"],
    description: L(
      "\"Yakında\" sayfasındaki formdan bırakılan e-postalar. Açılışta bu kişilere haber verin; adresleri başka bir amaçla kullanmayın. Listenin tamamını Excel'de açılabilir bir dosya olarak indirmek için tarayıcıda /api/signups/csv adresini açın.",
      "Emails left on the Coming soon page. Download the whole list at /api/signups/csv.",
    ),
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: () => false,
    delete: ({ req }) => Boolean(req.user),
  },
  endpoints: [
    {
      path: "/csv",
      method: "get",
      handler: async (req) => {
        if (!req.user) return Response.json({ error: "Giriş yapın." }, { status: 401 });
        const { docs } = await req.payload.find({ collection: "signups", pagination: false, sort: "createdAt", depth: 0, req });
        const rows = [
          ["email", "lang", "date"],
          ...docs.map((d) => [d.email, d.lang, d.createdAt]),
        ].map((r) => r.map(csvCell).join(","));
        const day = new Date().toISOString().slice(0, 10);
        // Başındaki BOM, Excel'in Türkçe karakterleri doğru okuması için.
        return new Response("﻿" + rows.join("\r\n"), {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="acilis-listesi-${day}.csv"`,
          },
        });
      },
    },
  ],
  fields: [
    { name: "email", type: "email", required: true, unique: true, label: L("E-posta", "Email") },
    {
      name: "lang",
      type: "select",
      label: L("Dil", "Language"),
      defaultValue: "tr",
      options: [
        { label: "Türkçe", value: "tr" },
        { label: "English", value: "en" },
      ],
    },
  ],
};
