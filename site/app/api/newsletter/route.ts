import { NextResponse } from "next/server";
import { escapeHtml, looksLikeBot, rateLimited, sendMail } from "@/lib/forms";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (looksLikeBot(raw)) return NextResponse.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) return NextResponse.json({ ok: false }, { status: 429 });

  const email = typeof raw.email === "string" ? raw.email.trim().slice(0, 160) : "";
  if (!EMAIL.test(email)) return NextResponse.json({ ok: false, errors: { email: "email" } }, { status: 422 });
  const lang = raw.lang === "en" ? "en" : "tr";

  const result = await sendMail({
    to: process.env.NEWSLETTER_TO_EMAIL || process.env.CONSULTATION_TO_EMAIL,
    subject: "Tahtırevan · Atölyeden mektuplar · yeni abone",
    html: `<p style="font-family:Georgia,serif">${escapeHtml(email)} (${lang})</p>`,
  });
  if (!result.ok) return NextResponse.json({ ok: false }, { status: 502 });
  return NextResponse.json({ ok: true });
}
