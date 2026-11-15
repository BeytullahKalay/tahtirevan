import Image from "next/image";
import type { Fabric, Img } from "@/lib/catalog";
import type { Lang } from "@/lib/i18n";
import { CHAIR, chairAlt } from "@/lib/media";

/**
 * Ürün portresi: kumaş duvarının önünde, tek ışık altında duran parça.
 * Kumaş kenarlarda görünür, ortası karanlıkta kalır; parça yavaşça süzülür.
 * Parçanın kendi fotoğrafı (`photo`) yoksa geçici koltuk fotoğrafı kullanılır.
 */
export function ChairScene({
  lang,
  fabric,
  photo,
  sizes = "100vw",
  priority,
  alt,
}: {
  lang: Lang;
  fabric: Fabric;
  photo?: Img;
  sizes?: string;
  priority?: boolean;
  alt?: string;
}) {
  const subject = photo ?? CHAIR;
  const label = alt ?? (photo?.alt?.[lang] || chairAlt(lang, fabric.name));
  return (
    <div className="chair-scene absolute inset-0" role="img" aria-label={label}>
      <Image src={fabric.image.src} alt="" fill sizes={sizes} priority={priority} className="kenburns object-cover" aria-hidden="true" />
      {/* Karartma kumaştan 2 px taşar: kumaşın kenar satırı karartmasız görünmesin (kırpmayı .media yapar) */}
      <div
        className="absolute inset-[-2px]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(58% 52% at 50% 52%, rgba(20,17,15,0.55) 0%, rgba(20,17,15,0.86) 55%, rgba(20,17,15,0.94) 100%)",
        }}
      />
      <div
        className="absolute inset-[-2px] mix-blend-soft-light"
        aria-hidden="true"
        style={{ background: `radial-gradient(45% 40% at 50% 40%, ${fabric.colors[0]}88 0%, transparent 70%)` }}
      />
      <div className="chair-shadow" aria-hidden="true" />
      <div className="chair-float absolute inset-x-[14%] bottom-[8%] top-[9%]">
        <Image
          src={subject.src}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="object-contain [filter:drop-shadow(0_30px_40px_rgba(0,0,0,0.55))]"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
