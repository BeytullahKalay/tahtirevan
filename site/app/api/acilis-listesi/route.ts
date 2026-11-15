import config from "@payload-config";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import { looksLikeBot, rateLimited } from "@/lib/forms";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** "Yakında" sayfasındaki "Haber ver" formu: e-postayı paneldeki Açılış listesine yazar. */
export async function POST(req: Request) {
  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  // Bot: teşekkür görünür ama hiçbir şey kaydedilmez.
  if (looksLikeBot(raw)) return NextResponse.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) return NextResponse.json({ ok: false }, { status: 429 });

  const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase().slice(0, 160) : "";
  if (!EMAIL.test(email)) return NextResponse.json({ ok: false, errors: { email: "email" } }, { status: 422 });
  const lang = raw.lang === "en" ? "en" : "tr";

  const payload = await getPayload({ config });
  const found = await payload.find({ collection: "signups", where: { email: { equals: email } }, limit: 1, depth: 0 });
  if (!found.totalDocs) {
    try {
      await payload.create({ collection: "signups", data: { email, lang } });
    } catch (e) {
      payload.logger.error({ err: e }, "Açılış listesine kayıt eklenemedi");
      return NextResponse.json({ ok: false }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: true });
}
