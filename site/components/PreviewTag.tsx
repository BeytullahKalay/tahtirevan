import type { Lang } from "@/lib/i18n";
import { PREVIEW_NOTE } from "@/lib/media";

/** Yapay zekâ ile üretilmiş koltuk görsellerinin üzerindeki "Tasarım önizlemesi · Kumaş gerçek" notu. */
export function PreviewTag({ lang, className = "" }: { lang: Lang; className?: string }) {
  return (
    <p className={`label pointer-events-none !text-[10px] !text-fildisi/75 [text-shadow:0_1px_10px_rgba(10,8,6,0.95)] ${className}`}>
      {PREVIEW_NOTE[lang]}
    </p>
  );
}
