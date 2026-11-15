/**
 * Site kapalıyken ("Yakında" / "Bakımdayız") ziyaretçiyi /durum sayfasına götürür.
 * Ayar panelde: Ayarlar → Site durumu. Panele giriş yapmış kullanıcılar siteyi normal görür.
 *
 * Adres çubuğu değişmez (rewrite): ziyaretçi hangi adresi açtıysa o adreste durum sayfasını görür,
 * site açılınca aynı adres gerçek sayfayı gösterir.
 */
import { NextResponse, type NextRequest } from "next/server";

type Mode = "live" | "soon" | "maintenance";

const MODE_TTL = 5_000; // Panelde yapılan değişiklik en geç bu kadar sonra geçerli olur.
const USER_TTL = 60_000;

let modeCache: { mode: Mode; at: number } | null = null;
const userCache = new Map<string, { ok: boolean; at: number }>();

async function getMode(origin: string): Promise<Mode> {
  if (modeCache && Date.now() - modeCache.at < MODE_TTL) return modeCache.mode;
  try {
    const r = await fetch(`${origin}/api/globals/site-status?depth=0&select[mode]=true`, { cache: "no-store" });
    const m = ((await r.json()) as { mode?: Mode }).mode;
    const mode: Mode = m === "soon" || m === "maintenance" ? m : "live";
    modeCache = { mode, at: Date.now() };
    return mode;
  } catch {
    // Ayar okunamazsa site kapanmasın.
    return modeCache?.mode ?? "live";
  }
}

/** Panel oturumu gerçekten geçerli mi? (Yalnızca çerezin varlığına bakmak yetmez.) */
async function isPanelUser(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("payload-token")?.value;
  if (!token) return false;
  const hit = userCache.get(token);
  if (hit && Date.now() - hit.at < USER_TTL) return hit.ok;
  let ok = false;
  try {
    const r = await fetch(`${req.nextUrl.origin}/api/users/me`, {
      headers: { cookie: `payload-token=${token}` },
      cache: "no-store",
    });
    ok = r.ok && Boolean(((await r.json()) as { user?: unknown }).user);
  } catch {
    ok = false;
  }
  if (userCache.size > 200) userCache.clear();
  userCache.set(token, { ok, at: Date.now() });
  return ok;
}

function langOf(req: NextRequest): "tr" | "en" {
  const p = req.nextUrl.pathname;
  if (p === "/en" || p.startsWith("/en/")) return "en";
  if (p === "/") {
    const al = (req.headers.get("accept-language") || "tr").toLowerCase();
    return al.startsWith("tr") ? "tr" : "en";
  }
  return "tr";
}

export async function proxy(req: NextRequest) {
  const mode = await getMode(req.nextUrl.origin);
  if (mode === "live") return NextResponse.next();
  if (await isPanelUser(req)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/durum";
  url.search = `?lang=${langOf(req)}`;
  const res = NextResponse.rewrite(url, mode === "maintenance" ? { status: 503 } : undefined);
  res.headers.set("Cache-Control", "no-store");
  // Arama motorlarına "geçici olarak kapalı, sonra tekrar gel" demek için.
  if (mode === "maintenance") res.headers.set("Retry-After", "3600");
  return res;
}

export const config = {
  // Panel, API, durum sayfasının kendisi, Next dosyaları ve uzantılı dosyalar (görsel, robots.txt…) hariç her sayfa.
  matcher: ["/((?!api|admin|durum|_next|.*\\.[A-Za-z0-9]+$).*)"],
};
