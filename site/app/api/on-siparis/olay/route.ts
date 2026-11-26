import config from "@payload-config";
import { getPayload } from "payload";
import { rateLimited } from "@/lib/forms";
import { BOT_UA, cleanSource, isProduct, istanbulDay } from "@/lib/preorder";

/**
 * Sipariş sayfasının adsız sayacı: "sayfayı açtı" ve "Sipariş ver'e bastı".
 * Kim olduğu tutulmaz (IP, çerez yok); yalnızca olay, gün ve kaynak. Bu yüzden çerez onayı gerekmez.
 */
export async function POST(req: Request) {
  if (BOT_UA.test(req.headers.get("user-agent") || "")) return new Response(null, { status: 204 });
  let raw: Record<string, unknown> = {};
  try {
    raw = JSON.parse(await req.text());
  } catch {
    return new Response(null, { status: 400 });
  }
  const type = raw.type === "view" || raw.type === "click" ? raw.type : null;
  if (!type || !isProduct(raw.product)) return new Response(null, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(`olay:${ip}`, 30)) return new Response(null, { status: 204 });

  const payload = await getPayload({ config });
  try {
    await payload.create({
      collection: "on-siparis-olaylari",
      data: { type, source: cleanSource(raw.source), product: raw.product, day: istanbulDay() },
    });
  } catch (e) {
    payload.logger.error({ err: e }, "Sayaç kaydı eklenemedi");
  }
  return new Response(null, { status: 204 });
}
