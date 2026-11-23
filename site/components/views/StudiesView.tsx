import Link from "next/link";
import { studyNumeral } from "@/lib/catalog";
import { getCatalog } from "@/lib/catalog.server";
import { fabricHref, href, type Lang } from "@/lib/i18n";
import { Reveal } from "../Reveal";
import { StudyCta } from "../StudyCta";
import { StudySlides } from "../StudySlides";

const COPY = {
  tr: {
    label: "Etütler",
    title: "Kumaştan gövdeye.",
    intro: "Etüt, bir kumaşın hangi gövdede en iyi duracağını görmek için yaptığımız dijital çalışmadır. Hiçbiri henüz üretilmedi; beğendiğiniz etüt siparişle, sizin ölçünüzde yapılır.",
    study: "Etüt",
    fabric: "Kumaş",
    see: "Etüdü incele",
    empty: "Etütler hazırlanıyor.",
    outroTitle: "Aklınızda bir etüt mü var?",
    outroLine: "Gövdeyi, ölçüyü ve desenin yerleşimini birlikte seçeriz. Çizim onayından teslime yaklaşık 12 hafta.",
    cta: "Görüşme talep edin",
    patterns: "Tüm kumaşları görün",
  },
  en: {
    label: "Studies",
    title: "From fabric to form.",
    intro: "A study is a digital sketch we make to see which body a fabric suits best. None has been made yet; the one you choose is made to order, to your measurements.",
    study: "Study",
    fabric: "Fabric",
    see: "View the study",
    empty: "The studies are in preparation.",
    outroTitle: "Is there a study on your mind?",
    outroLine: "We choose the body, the size and the placement of the pattern together. About 12 weeks from approved drawing to delivery.",
    cta: "Request a consultation",
    patterns: "See all fabrics",
  },
};

/** Etütler dizini: panelde yayında olan tüm etütler, paneldeki sırayla. Her kart kumaş sayfasındaki etüde gider. */
export async function StudiesView({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  const { studies, getFabric } = await getCatalog();

  return (
    <>
      <section className="px-[var(--gutter)] pb-[8vh] pt-36 lg:pt-48">
        <Reveal className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="label">{c.label}</p>
            <h1 className="display mt-4">{c.title}</h1>
          </div>
          <p className="lede max-w-[46ch] !text-tas lg:col-span-5">{c.intro}</p>
        </Reveal>
      </section>

      <section className="px-[var(--gutter)] pb-[14vh]">
        {studies.length === 0 ? (
          <p className="text-tas">{c.empty}</p>
        ) : (
          <ul className="grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10">
            {studies.map((s, i) => {
              const f = getFabric(s.fabric);
              return (
                <Reveal as="li" key={s.id} delay={(i % 3) * 0.1} className={i % 3 === 1 ? "lg:mt-24" : ""}>
                  <Link href={`${fabricHref(lang, f.id)}#etut-${s.id}`} className="group block" data-cursor="explore" aria-label={`${c.study} ${studyNumeral(i + 1)} · ${s.name[lang]} · ${f.name}`}>
                    <div className="border border-altin/25 bg-[#1b1612] p-[clamp(10px,1.4vw,18px)] transition-colors duration-700 group-hover:border-altin/60">
                      <StudySlides
                        images={s.gallery}
                        lang={lang}
                        alt={s.image.alt?.[lang] || `${s.name[lang]} · ${f.name}`}
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                        priority={i < 3}
                        offset={(i % 3) * 1200}
                        className="zoomable aspect-[3/4] w-full"
                      />
                    </div>
                    <p className="label mt-5 !text-[10px]">
                      {c.study} {studyNumeral(i + 1)} · {c.fabric}: {f.name}
                    </p>
                    <h2 className="mt-2 font-serif text-3xl font-light leading-none">
                      <span className="link-gold">{s.name[lang]}</span>
                    </h2>
                    <p className="mt-4 max-w-[40ch] text-tas">{s.line[lang]}</p>
                    <StudyCta text={c.see} />
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        )}
      </section>

      <section className="border-t hairline px-[var(--gutter)] py-[14vh]">
        <Reveal className="grid gap-8 lg:grid-cols-12">
          <h2 className="display-sm lg:col-span-5">{c.outroTitle}</h2>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="lede max-w-[46ch] !text-tas">{c.outroLine}</p>
            <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-6">
              <Link href={href(lang, "consultation")} className="btn">
                {c.cta}
              </Link>
              <Link href={href(lang, "patterns")} className="link-gold is-static label tap !text-fildisi">
                {c.patterns}
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
