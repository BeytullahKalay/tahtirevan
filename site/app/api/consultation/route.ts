import { NextResponse } from "next/server";
import { escapeHtml, looksLikeBot, parseConsultation, rateLimited, sendMail } from "@/lib/forms";

export async function POST(req: Request) {
  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad-request" }, { status: 400 });
  }

  // Botlara başarılı görünen ama hiçbir şey göndermeyen yanıt
  if (looksLikeBot(raw)) return NextResponse.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) return NextResponse.json({ ok: false, error: "rate-limited" }, { status: 429 });

  const { data, errors } = parseConsultation(raw);
  if (!data) return NextResponse.json({ ok: false, errors }, { status: 422 });

  const rows: [string, string][] = [
    ["Talep", data.request],
    ["Ad soyad", data.name],
    ["E-posta", data.email],
    ["Telefon", data.phone || "-"],
    ["Ülke / şehir", data.location],
    ["İlgilenilen parça / koleksiyon", data.interest || "-"],
    ["Proje türü", { konut: "Konut", "ic-mimar": "İç mimar / stüdyo", otel: "Otel / kulüp / kurumsal" }[data.projectType]],
    ["Görüşme biçimi", { ev: "Ev ziyareti", video: "Video görüşme", telefon: "Telefon" }[data.meeting]],
    ["Dil", data.lang],
    ["Not", data.note || "-"],
    ["KVKK / GDPR onayı", data.consent ? "Evet" : "Hayır"],
  ];
  const html = `<table cellpadding="6" style="font-family:Georgia,serif;font-size:15px">${rows
    .map(([k, v]) => `<tr><td style="color:#777;vertical-align:top">${k}</td><td>${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`)
    .join("")}</table>`;

  const result = await sendMail({
    to: process.env.CONSULTATION_TO_EMAIL || "hi@tahtirevan.com",
    subject: `Tahtırevan · ${data.request === "katalog" ? "Katalog talebi" : data.request === "basin" ? "Basın talebi" : "Özel görüşme talebi"} · ${data.name}`,
    html,
    replyTo: data.email,
  });

  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
  return NextResponse.json({ ok: true });
}
