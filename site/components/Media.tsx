import Image from "next/image";
import type { Lang } from "@/lib/i18n";

export type Shot = "portrait" | "macro" | "fabric" | "craft" | "space" | "video";

const SHOT_LABEL: Record<Shot, { tr: string; en: string }> = {
  portrait: { tr: "Ürün portresi", en: "Product portrait" },
  macro: { tr: "Gövde makro detayı", en: "Frame macro detail" },
  fabric: { tr: "Kumaş detayı", en: "Fabric detail" },
  craft: { tr: "Zanaat detayı", en: "Craft detail" },
  space: { tr: "Yaşam alanı", en: "Interior" },
  video: { tr: "Sessiz video döngüsü", en: "Silent video loop" },
};

type Props = {
  lang: Lang;
  shot: Shot;
  /** Çekimde ne görüneceği: yer tutucunun üzerinde yazar ve alt metin olur. */
  subject: string;
  alt?: string;
  src?: string;
  colors?: string[];
  className?: string;
  sizes?: string;
  priority?: boolean;
  zoom?: boolean;
  cursor?: boolean;
  /** Etiket konumu; tam ekran görsellerde metinle çakışmaması için. */
  labelPosition?: "bottom-left" | "top-right" | "center";
  hideLabel?: boolean;
};

/**
 * Gerçek fotoğraf gelene kadar koyu, tek yönden ışık alan bir yer tutucu çizer.
 * Renk yalnızca kumaştan gelir: arayüz nötr kalır.
 */
export function Media({
  lang,
  shot,
  subject,
  alt,
  src,
  colors = [],
  className = "",
  sizes = "100vw",
  priority,
  zoom = true,
  cursor = true,
  labelPosition = "bottom-left",
  hideLabel,
}: Props) {
  const label = SHOT_LABEL[shot][lang];
  const altText = alt ?? `${label}: ${subject}`;
  const [a = "#3a2c22", b = a, c = b] = colors;

  const tone =
    shot === "fabric"
      ? `radial-gradient(60% 70% at 22% 30%, ${a}e6 0%, transparent 70%),
         radial-gradient(55% 60% at 78% 62%, ${b}d9 0%, transparent 72%),
         radial-gradient(45% 55% at 46% 88%, ${c}cc 0%, transparent 70%),
         radial-gradient(40% 40% at 70% 12%, ${a}99 0%, transparent 70%),
         #1d1814`
      : shot === "video" || shot === "portrait" || shot === "space"
        ? `radial-gradient(70% 85% at 24% 18%, ${a}66 0%, transparent 62%),
           radial-gradient(40% 50% at 58% 64%, ${b}40 0%, transparent 70%),
           #17130f`
        : `radial-gradient(85% 75% at 16% 12%, ${a}59 0%, transparent 58%),
           radial-gradient(60% 60% at 70% 80%, #3a2c2255 0%, transparent 70%),
           #19150f`;

  const pos =
    labelPosition === "top-right"
      ? "right-5 top-28 items-end text-right md:right-8 md:top-36"
      : labelPosition === "center"
        ? "inset-0 items-center justify-center text-center"
        : "bottom-5 left-5 md:bottom-7 md:left-7";

  return (
    <div
      className={`media ${zoom ? "zoomable" : ""} ${className}`}
      data-cursor={cursor ? "explore" : undefined}
      role={src ? undefined : "img"}
      aria-label={src ? undefined : altText}
    >
      {src ? (
        <div className="media-inner">
          <Image src={src} alt={altText} fill sizes={sizes} priority={priority} className="object-cover" />
        </div>
      ) : (
        <>
          <div className="media-inner" style={{ background: tone }} aria-hidden="true" />
          {!hideLabel && (
            <div
              className={`pointer-events-none absolute flex max-w-[calc(100%-2.5rem)] flex-col gap-1 md:max-w-[min(26rem,calc(100%-4rem))] ${pos}`}
              aria-hidden="true"
            >
              <span className="label !text-[10px] !text-fildisi/70">{label}</span>
              <span className="font-serif text-lg italic leading-tight text-fildisi/80">{subject}</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-fildisi/45">
                {lang === "tr" ? "Yer tutucu görsel" : "Placeholder image"}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
