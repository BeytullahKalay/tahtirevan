import Link from "next/link";
import { getCollection, getFabric, typeLabel, type Piece } from "@/lib/content";
import { pieceHref, type Lang } from "@/lib/i18n";
import { Media } from "./Media";

type Props = { piece: Piece; lang: Lang; aspect?: string; sizes?: string };

/** Kartta yalnızca görsel, ad ve koleksiyon adı. Fiyat yok. */
export function PieceCard({ piece, lang, aspect = "aspect-[4/5]", sizes = "(min-width: 1024px) 50vw, 100vw" }: Props) {
  const col = getCollection(piece.collection);
  const fabric = getFabric(piece.fabric);
  return (
    <Link href={pieceHref(lang, piece)} className="group block">
      <Media
        lang={lang}
        shot="portrait"
        subject={`${piece.name} ${typeLabel(piece.type, lang).toLocaleLowerCase(lang)}, ${fabric.name}`}
        colors={fabric.colors}
        className={`w-full ${aspect}`}
        sizes={sizes}
      />
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-3xl font-light leading-none">
          <span className="link-gold">{piece.name}</span>
        </h3>
        <span className="label">
          {col.name[lang]} · {typeLabel(piece.type, lang)}
        </span>
      </div>
    </Link>
  );
}
