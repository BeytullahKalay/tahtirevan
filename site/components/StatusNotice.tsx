import type { SiteSettings } from "@/lib/catalog";
import type { Lang } from "@/lib/i18n";

const TEXT = {
  soon: { tr: "Ziyaretçiler şu an “Yakında” sayfasını görüyor", en: "Visitors currently see the Coming soon page" },
  maintenance: { tr: "Ziyaretçiler şu an “Bakımdayız” sayfasını görüyor", en: "Visitors currently see the Maintenance page" },
};

/**
 * Site ziyaretçilere kapalıyken siteyi yalnızca panele giriş yapmış kullanıcılar görür (proxy.ts).
 * Onlara sitenin kapalı olduğunu hatırlatan küçük not.
 */
export function StatusNotice({ mode, lang }: { mode: SiteSettings["mode"]; lang: Lang }) {
  if (mode === "live") return null;
  const preview = mode === "soon" ? "yakinda" : "bakim";
  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 z-[70] flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-x-4 gap-y-1 border border-altin/60 bg-gece/95 px-4 py-3 text-[13px] leading-snug text-fildisi"
    >
      <span>{TEXT[mode][lang]}</span>
      <a href={`/durum?onizle=${preview}&lang=${lang}`} className="text-altin underline-offset-4 hover:underline">
        {lang === "tr" ? "Önizle" : "Preview"}
      </a>
      <a href="/admin/globals/site-status" className="text-altin underline-offset-4 hover:underline">
        {lang === "tr" ? "Ayarı değiştir" : "Change"}
      </a>
    </div>
  );
}
