import Image from "next/image";
import Link from "next/link";
import { priceAmount, type Offer } from "@/lib/preorder";
import { Reveal } from "./Reveal";

/**
 * Siparişe açık bir parçanın sitedeki vitrini (anasayfa ve koleksiyon sayfası).
 * Lüks vitrin düzeni: büyük görsel, sakin fiyat, teslim süresi, iki yol: "İncele ve sipariş ver" ya da özel görüşme.
 * Görsel kartı kenar boşluksuz (bkz. CLAUDE.md "Görsel kartlarında kenar boşluğu bırakma").
 */
export function OfferFeature({ offer, label, headingLevel = 2, priority = false }: { offer: Offer; label: string; headingLevel?: 2 | 3; priority?: boolean }) {
  const amount = offer.price ? priceAmount(offer.price) : null;
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
      <Reveal className="lg:col-span-6">
        <Link href={offer.href} className="group block" data-cursor="explore">
          <div className="relative overflow-hidden border border-altin/25 bg-[#1b1612] p-[clamp(10px,1.4vw,18px)] transition-colors duration-700 group-hover:border-altin/60">
            <span aria-hidden="true" className="absolute inset-x-[-1px] bottom-[-1px] h-[3px] bg-lal" />
            <div className="overflow-hidden">
              <Image
                src={offer.image.src}
                alt={offer.image.alt}
                width={offer.image.w}
                height={offer.image.h}
                unoptimized
                priority={priority}
                className="h-auto w-full transition-transform duration-[1600ms] ease-out group-hover:scale-[1.03]"
              />
            </div>
          </div>
        </Link>
      </Reveal>

      <Reveal className="lg:col-span-5 lg:col-start-8" delay={0.15}>
        <p className="label !text-altin">{label}</p>
        <H className="display-md mt-4">
          <Link href={offer.href} className="link-gold">
            {offer.title}
          </Link>
        </H>
        <p className="display-sm mt-1 !text-2xl text-tas">{offer.type}</p>
        <p className="mt-6 max-w-[42ch] text-fildisi/85">{offer.line}</p>

        <dl className="mt-8 grid max-w-[420px] grid-cols-2 gap-x-8 gap-y-5 border-t hairline pt-6">
          <div>
            <dt className="label">Fiyat</dt>
            <dd className="mt-2 text-fildisi">
              {amount ? (
                <span className="flex items-baseline gap-2">
                  <span className="font-serif text-[1.7rem] font-light leading-none tracking-[0.04em]">{amount}</span>
                  <span className="label !text-fildisi/70">TL</span>
                </span>
              ) : (
                <span className="text-[15px]">{offer.price || "Görüşmede paylaşılır"}</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="label">Teslim</dt>
            <dd className="mt-2 text-[15px] text-fildisi">{offer.leadTime}</dd>
          </div>
        </dl>

        <div className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-10">
          <Link href={offer.href} className="btn">
            {offer.open ? "İncele ve sipariş ver" : "İncele"}
          </Link>
          <Link href="/gorusme" className="link-gold is-static label tap !text-fildisi">
            Özel görüşme
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
