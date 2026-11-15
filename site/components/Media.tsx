"use client";

import Image from "next/image";
import type { Img } from "@/lib/catalog";
import type { Lang } from "@/lib/i18n";
import { DETAILS, detailFor } from "@/lib/media";
import { useCatalog } from "./CatalogProvider";
import { ChairScene } from "./ChairScene";

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
  /** Çekimde ne görünmesi istendiği; gerçek görsel yokken alt metin olur. */
  subject: string;
  alt?: string;
  src?: string;
  /** Kumaş kimliği: kumaş çekimlerinde görseli, ürün çekimlerinde arka planı belirler. */
  fabric?: string;
  /** Ürün/mekân çekimlerinde parçanın kendi fotoğrafı (yoksa geçici koltuk fotoğrafı). */
  photo?: Img;
  /** Makro/zanaat çekimlerinde hangi yakın kırpımın kullanılacağı (yoksa konudan seçilir). */
  detail?: number;
  colors?: string[];
  className?: string;
  sizes?: string;
  priority?: boolean;
  zoom?: boolean;
  cursor?: boolean;
  /** Eski yer tutucu etiketinden kalan; uyumluluk için duruyor. */
  labelPosition?: "bottom-left" | "top-right" | "center";
  hideLabel?: boolean;
};

/**
 * Görsel alanı. `src` verilmezse geçici kütüphaneden çözer:
 * kumaş çekimi → katalog kumaşı, ürün/mekân → Serir fotoğrafı kumaşın önünde,
 * makro/zanaat → aynı fotoğraftan yakın kırpım.
 */
export function Media({
  lang,
  shot,
  subject,
  alt,
  src,
  fabric,
  photo,
  detail,
  className = "",
  sizes = "100vw",
  priority,
  zoom = true,
  cursor = true,
}: Props) {
  const { getFabric } = useCatalog();
  const label = SHOT_LABEL[shot][lang];
  const wrap = `media ${zoom ? "zoomable" : ""} ${className}`;
  const cursorAttr = cursor ? "explore" : undefined;

  if (src) {
    return (
      <div className={wrap} data-cursor={cursorAttr}>
        <div className="media-inner">
          <Image src={src} alt={alt ?? `${label}: ${subject}`} fill sizes={sizes} priority={priority} className="object-cover" />
        </div>
      </div>
    );
  }

  if (shot === "fabric") {
    const f = getFabric(fabric ?? "");
    return (
      <div className={wrap} data-cursor={cursorAttr}>
        <div className="media-inner">
          <Image
            src={f.image.src}
            alt={alt ?? `${f.name} · ${f.motif[lang]}`}
            fill
            sizes={sizes}
            priority={priority}
            className="kenburns object-cover"
          />
        </div>
      </div>
    );
  }

  if (shot === "macro" || shot === "craft") {
    const d = detail === undefined ? detailFor(subject) : DETAILS[detail % DETAILS.length];
    return (
      <div className={wrap} data-cursor={cursorAttr}>
        <div className="media-inner">
          <Image src={d.src} alt={alt ?? d.alt[lang]} fill sizes={sizes} priority={priority} className="object-cover" />
        </div>
      </div>
    );
  }

  return (
    <div className={wrap} data-cursor={cursorAttr}>
      <div className="media-inner">
        <ChairScene lang={lang} fabric={getFabric(fabric ?? "")} photo={photo} sizes={sizes} priority={priority} alt={alt} />
      </div>
    </div>
  );
}
