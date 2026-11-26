import type { CollectionConfig } from "payload";
import { L } from "../shared";

/**
 * Reklam testi: /siparis/<ürün> sayfasından gelen ön siparişler ve sayfanın sayaçları.
 * Kayıtlar yalnızca sunucudan eklenir (app/api/on-siparis). Ödeme alınmaz; kişiyi telefonla arayıp
 * "Durum" alanına sonucu yazarsınız. Sayaç özeti: /api/on-siparis-olaylari/rapor
 */

const csvCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const signedIn = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);

export const PREORDER_STATUS = [
  { label: L("Yeni, aranmadı", "New"), value: "yeni" },
  { label: L("Arandı, düşünüyor", "Called, thinking"), value: "arandi" },
  { label: L("Kapora konuşuldu", "Deposit agreed"), value: "kapora" },
  { label: L("Vazgeçti", "Dropped"), value: "vazgecti" },
  { label: L("Ulaşılamadı", "Unreachable"), value: "ulasilamadi" },
];

export const Preorders: CollectionConfig = {
  slug: "on-siparisler",
  labels: { singular: L("Ön sipariş", "Pre-order"), plural: L("Ön siparişler", "Pre-orders") },
  admin: {
    group: L("Reklam testi", "Ad test"),
    useAsTitle: "name",
    defaultColumns: ["name", "phone", "city", "status", "source", "createdAt"],
    description: L(
      "Sipariş sayfasında \"Sipariş ver\" deyip formu dolduranlar. Ödeme alınmadı; her kişiyi arayıp sonucu \"Durum\" alanına yazın. Listenin tamamını indirmek için /api/on-siparisler/csv, sayfanın sayaçları için /api/on-siparis-olaylari/rapor adresini açın.",
      "People who filled in the order form. No payment was taken. Download: /api/on-siparisler/csv · Counters: /api/on-siparis-olaylari/rapor",
    ),
  },
  access: { read: signedIn, create: () => false, update: signedIn, delete: signedIn },
  endpoints: [
    {
      path: "/csv",
      method: "get",
      handler: async (req) => {
        if (!req.user) return Response.json({ error: "Giriş yapın." }, { status: 401 });
        const { docs } = await req.payload.find({ collection: "on-siparisler", pagination: false, sort: "createdAt", depth: 0, req });
        const rows = [
          ["sira", "urun", "ad", "telefon", "e-posta", "sehir", "not", "kaynak", "durum", "tarih"],
          ...docs.map((d) => [d.queue, d.product, d.name, d.phone, d.email, d.city, d.note, d.source, d.status, d.createdAt]),
        ].map((r) => r.map(csvCell).join(","));
        const day = new Date().toISOString().slice(0, 10);
        return new Response("﻿" + rows.join("\r\n"), {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="on-siparisler-${day}.csv"`,
          },
        });
      },
    },
  ],
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true, label: L("Ad soyad", "Name") },
        { name: "phone", type: "text", required: true, label: L("Telefon", "Phone") },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "email", type: "text", label: L("E-posta", "Email") },
        { name: "city", type: "text", label: L("Şehir", "City") },
      ],
    },
    { name: "note", type: "textarea", label: L("Not", "Note") },
    {
      name: "status",
      type: "select",
      defaultValue: "yeni",
      label: L("Durum", "Status"),
      options: PREORDER_STATUS,
      admin: { position: "sidebar", description: L("Aradıktan sonra güncelleyin.", "Update after calling.") },
    },
    {
      name: "callNote",
      type: "textarea",
      label: L("Görüşme notu", "Call note"),
      admin: { position: "sidebar", description: L("Telefonda ne konuştunuz? Fiyat, renk, ölçü, itiraz…", "What was said on the call?") },
    },
    { name: "product", type: "text", label: L("Ürün", "Product"), admin: { readOnly: true, position: "sidebar" } },
    { name: "queue", type: "number", label: L("Sıra no", "Queue no"), admin: { readOnly: true, position: "sidebar" } },
    {
      name: "source",
      type: "text",
      label: L("Nereden geldi", "Source"),
      admin: { readOnly: true, position: "sidebar", description: L("instagram = reklamdan", "instagram = from the ad") },
    },
    { name: "consent", type: "checkbox", label: L("KVKK onayı", "Consent"), admin: { readOnly: true, position: "sidebar" } },
  ],
};

const EVENT_TYPES = [
  { label: L("Sayfayı açtı", "Viewed"), value: "view" },
  { label: L("Sipariş ver'e bastı", "Clicked order"), value: "click" },
  { label: L("Formu gönderdi", "Submitted"), value: "submit" },
];

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);
const pct = (a: number, b: number) => (b ? `%${((a / b) * 100).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}` : "–");

/** Sipariş sayfasının adsız sayaçları: kim olduğu tutulmaz, yalnızca ne zaman ve nereden. */
export const PreorderEvents: CollectionConfig = {
  slug: "on-siparis-olaylari",
  labels: { singular: L("Sayfa sayacı kaydı", "Counter entry"), plural: L("Sayfa sayaçları", "Page counters") },
  admin: {
    group: L("Reklam testi", "Ad test"),
    defaultColumns: ["type", "source", "product", "createdAt"],
    description: L(
      "Her satır bir ziyaret, bir \"Sipariş ver\" tıklaması ya da bir form gönderimi. Kişisel bilgi tutulmaz. Günlere göre özet tablo için tarayıcıda /api/on-siparis-olaylari/rapor adresini açın.",
      "One row per view, click or submission. No personal data. Summary: /api/on-siparis-olaylari/rapor",
    ),
  },
  access: { read: signedIn, create: () => false, update: () => false, delete: signedIn },
  endpoints: [
    {
      path: "/rapor",
      method: "get",
      handler: async (req) => {
        if (!req.user) return new Response("Önce panele giriş yapın: /admin", { status: 401, headers: { "Content-Type": "text/plain; charset=utf-8" } });
        const { docs } = await req.payload.find({
          collection: "on-siparis-olaylari",
          pagination: false,
          depth: 0,
          sort: "createdAt",
          select: { type: true, source: true, day: true, product: true },
          req,
        });
        type Row = { view: number; viewAd: number; click: number; clickAd: number; submit: number; submitAd: number };
        const blank = (): Row => ({ view: 0, viewAd: 0, click: 0, clickAd: 0, submit: 0, submitAd: 0 });
        const days = new Map<string, Row>();
        const total = blank();
        for (const d of docs) {
          const key = d.day || "?";
          const row = days.get(key) ?? blank();
          const ad = d.source === "instagram" || d.source === "meta";
          const t = d.type as "view" | "click" | "submit";
          for (const r of [row, total]) {
            r[t] += 1;
            if (ad) r[`${t}Ad` as const] += 1;
          }
          days.set(key, row);
        }
        const tr = (label: string, r: Row, strong = false) => {
          const td = (v: string | number) => `<td${strong ? ' class="b"' : ""}>${esc(v)}</td>`;
          return `<tr>${td(label)}${td(r.view)}${td(r.viewAd)}${td(r.click)}${td(pct(r.click, r.view))}${td(r.submit)}${td(pct(r.submit, r.view))}</tr>`;
        };
        const body = [...days.entries()]
          .sort(([a], [b]) => (a < b ? 1 : -1))
          .map(([day, r]) => tr(day, r))
          .join("");
        const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Reklam testi · sayaçlar</title>
<style>body{font:15px/1.5 system-ui,sans-serif;background:#14110f;color:#e9e1d3;margin:0;padding:32px 20px}main{max-width:860px;margin:auto}h1{font-weight:400;font-size:26px;margin:0 0 4px}p{color:#a79e90;margin:0 0 20px}table{border-collapse:collapse;width:100%}th,td{text-align:right;padding:10px 8px;border-bottom:1px solid #3a332d}th:first-child,td:first-child{text-align:left}th{font-weight:500;color:#b08d57;font-size:13px}.b{font-weight:600;color:#fff}a{color:#b08d57}ul{color:#a79e90;padding-left:18px}</style></head>
<body><main><h1>Sipariş sayfası · sayaçlar</h1><p>Toplam ${docs.length} kayıt. En yeni gün üstte. "Reklamdan" = bağlantısında instagram etiketi olanlar.</p>
<table><thead><tr><th>Gün</th><th>Sayfayı açan</th><th>· reklamdan</th><th>Sipariş ver'e basan</th><th>Oran</th><th>Formu gönderen</th><th>Oran</th></tr></thead>
<tbody>${tr("Toplam", total, true)}${body}</tbody></table>
<ul><li>Oranlar sayfayı açanlara göre hesaplanır.</li><li>Formu gönderenlerin adı ve telefonu: <a href="/admin/collections/on-siparisler">Panel › Ön siparişler</a></li><li>Reklamın gösterim ve tıklama sayıları Instagram Reklam Yöneticisi'nde görünür.</li></ul></main></body></html>`;
        return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
      },
    },
  ],
  fields: [
    { name: "type", type: "select", required: true, options: EVENT_TYPES, label: L("Ne oldu", "Event") },
    { name: "source", type: "text", label: L("Nereden geldi", "Source") },
    { name: "product", type: "text", label: L("Ürün", "Product") },
    { name: "day", type: "text", index: true, label: L("Gün (Türkiye saati)", "Day (Turkey time)") },
  ],
};
