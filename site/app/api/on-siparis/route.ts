import config from "@payload-config";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import { looksLikeBot, rateLimited } from "@/lib/forms";
import { PRODUCTS, istanbulDay, parsePreorder } from "@/lib/preorder";

/**
 * Sipariş sayfasındaki form: kişiyi paneldeki "Ön siparişler"e yazar, sıra numarasını döner.
 * Ödeme alınmaz. Bildirim e-postası Netlify'da tarayıcıdan Netlify Forms'a ayrıca gönderilir.
 */
export async function POST(req: Request) {
  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  // Bot: teşekkür görünür ama hiçbir şey kaydedilmez.
  if (looksLikeBot(raw)) return NextResponse.json({ ok: true, queue: null });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(`on-siparis:${ip}`)) return NextResponse.json({ ok: false }, { status: 429 });

  const { data, errors } = parsePreorder(raw);
  if (!data) return NextResponse.json({ ok: false, errors }, { status: 422 });

  const payload = await getPayload({ config });
  try {
    const { totalDocs } = await payload.count({ collection: "on-siparisler", where: { product: { equals: PRODUCTS[data.product].name } } });
    const queue = totalDocs + 1;
    await payload.create({
      collection: "on-siparisler",
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        city: data.city,
        note: data.note,
        consent: data.consent,
        product: PRODUCTS[data.product].name,
        source: data.source,
        queue,
        status: "yeni",
      },
    });
    await payload.create({
      collection: "on-siparis-olaylari",
      data: { type: "submit", source: data.source, product: data.product, day: istanbulDay() },
    });
    return NextResponse.json({ ok: true, queue });
  } catch (e) {
    payload.logger.error({ err: e }, "Ön sipariş kaydedilemedi");
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
