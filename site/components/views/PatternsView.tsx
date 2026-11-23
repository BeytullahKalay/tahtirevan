import Link from "next/link";
import { getCatalog } from "@/lib/catalog.server";
import { fabricHref, pieceHref, type Lang } from "@/lib/i18n";
import { countWord } from "@/lib/words";
import { Media } from "../Media";
import { Reveal } from "../Reveal";

const COPY = {
  tr: {
    label: "Desen kütüphanesi",
    title: "Cesur desen, sessiz zanaat.",
    line: (fabrics: number, codes: number) =>
      `Tahtırevan'ın ${countWord(fabrics, "tr")} kumaşı ${countWord(codes, "tr")} desen kodunda toplanır. Desenler, Anadolu'yu kumaş ve ticaret yollarıyla dünyaya bağlayan geleneklerden gelir: buta, damask, bahçe ve hayvan figürleri.`,
    honestTitle: "Kumaş nasıl yapılır",
    honest:
      "Desen kumaşa yüksek çözünürlüklü baskıyla aktarılır. Elde yapılan kısım döşemedir: desenin gövdeye ortalanması, nakış ve son işçilik. Her parçada üç imza bulunur: nakış, püskül, pirinç damga.",
    code: "Desen kodu",
    fabrics: "Kumaşlar",
    colors: "Renk notları",
    scale: "Ölçek",
    suits: "Uygun gövdeler",
    pieces: "Bu kodla yapılan parçalar",
    study: "Etüt",
    open: "Kumaşı incele",
  },
  en: {
    label: "Pattern library",
    title: "Bold pattern, quiet craft.",
    line: (fabrics: number, codes: number) =>
      `Tahtırevan's ${countWord(fabrics, "en")} fabrics gather into ${countWord(codes, "en")} pattern codes. They come from the traditions that tied Anatolia to the world along the roads of cloth and trade: paisley, damask, gardens and animal figures.`,
    honestTitle: "How the fabric is made",
    honest:
      "The pattern is printed onto the cloth in high resolution. What is made by hand is the upholstery: centring the pattern on the body, the embroidery and the finishing. Every piece carries three marks: embroidery, a tassel and a brass seal.",
    code: "Pattern code",
    fabrics: "Fabrics",
    colors: "Colour notes",
    scale: "Scale",
    suits: "Suited to",
    pieces: "Pieces in this code",
    study: "Study",
    open: "View the fabric",
  },
};

export async function PatternsView({ lang }: { lang: Lang }) {
  const { fabrics, fabricsByCode, codes: patternCodes, piecesByCode, studiesByFabric, typeLabel } = await getCatalog();
  const c = COPY[lang];
  return (
    <>
      <section className="px-[var(--gutter)] pb-[12vh] pt-36 lg:pt-48">
        <Reveal className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="label">{c.label}</p>
            <h1 className="display mt-4">{c.title}</h1>
          </div>
          <p className="lede !text-tas lg:col-span-5">{c.line(fabrics.length, patternCodes.length)}</p>
        </Reveal>
        <nav aria-label={c.code} className="mt-14 flex flex-wrap gap-x-10 gap-y-3 border-t hairline pt-6">
          {patternCodes.map((code, i) => (
            <a key={code.id} href={`#${code.slug[lang]}`} className="link-gold tap font-serif text-2xl">
              <span className="label mr-3 !text-[10px]">{String(i + 1).padStart(2, "0")}</span>
              {code.name[lang]}
            </a>
          ))}
        </nav>
      </section>

      {patternCodes.map((code, i) => {
        const list = fabricsByCode(code.id);
        const made = piecesByCode(code.id);
        return (
          <section key={code.id} id={code.slug[lang]} aria-labelledby={`h-${code.id}`} className="scroll-mt-0">
            <div className="relative h-[100svh] min-h-[560px]">
              <Media
                lang={lang}
                shot="fabric"
                subject={`${code.name[lang]} · ${list.map((f) => f.name).join(", ")}`}
                colors={code.colors}
                fabric={code.lead}
                className="absolute inset-0"
                labelPosition="top-right"
                sizes="100vw"
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: "linear-gradient(to top, rgba(20,17,15,0.9) 0%, rgba(20,17,15,0.3) 40%, rgba(20,17,15,0) 64%)",
                }}
                aria-hidden="true"
              />
              <div className="absolute inset-x-0 bottom-0 grid gap-6 px-[var(--gutter)] pb-[10svh] lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-6">
                  <p className="label !text-fildisi/80">
                    {c.code} {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 id={`h-${code.id}`} className="display mt-3">
                    {code.name[lang]}
                  </h2>
                </div>
                <p className="max-w-[46ch] text-lg text-fildisi/90 lg:col-span-5 lg:col-start-8">{code.description[lang]}</p>
              </div>
            </div>

            <div className="px-[var(--gutter)] py-[12vh]">
              <p className="label">{c.fabrics}</p>
              <ul className="mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
                {list.map((f, j) => (
                  <Reveal as="li" key={f.id} delay={j * 0.1}>
                    <Link href={fabricHref(lang, f.id)} className="group block" aria-label={`${f.name} · ${c.open}`}>
                      <Media
                        lang={lang}
                        shot="fabric"
                        subject={`${f.name} · ${f.motif[lang]}`}
                        colors={f.colors}
                        fabric={f.id}
                        className="aspect-square w-full"
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      />
                      <h3 className="mt-5 flex items-baseline justify-between gap-4 font-serif text-3xl font-light">
                        <span className="link-gold">{f.name}</span>
                        {studiesByFabric(f.id).length > 0 && <span className="label !text-[10px] !text-altin">{c.study}</span>}
                      </h3>
                      <p className="text-tas">{f.motif[lang]}</p>
                    </Link>
                    <dl className="mt-4 flex flex-col gap-2 text-[15px]">
                      <div>
                        <dt className="label !text-[10px]">{c.colors}</dt>
                        <dd>{f.colorNotes[lang]}</dd>
                      </div>
                      <div>
                        <dt className="label !text-[10px]">{c.scale}</dt>
                        <dd>{f.scale[lang]}</dd>
                      </div>
                      <div>
                        <dt className="label !text-[10px]">{c.suits}</dt>
                        <dd>{f.suitableFor.map((t) => typeLabel(t, lang, true)).join(" · ")}</dd>
                      </div>
                    </dl>
                  </Reveal>
                ))}
              </ul>

              {made.length > 0 && (
                <div className="mt-16 flex flex-col gap-4 border-t hairline pt-8 md:flex-row md:items-baseline md:gap-10">
                  <p className="label shrink-0">{c.pieces}</p>
                  <ul className="flex flex-wrap gap-x-8 gap-y-3">
                    {made.map((p) => (
                      <li key={p.id}>
                        <Link href={pieceHref(lang, p)} className="link-gold tap font-serif text-2xl">
                          {p.name} <span className="text-base text-tas">{typeLabel(p.type, lang)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        );
      })}

      <section className="border-t hairline px-[var(--gutter)] py-[14vh]">
        <Reveal className="grid gap-8 lg:grid-cols-12">
          <h2 className="display-sm lg:col-span-4">{c.honestTitle}</h2>
          <p className="lede max-w-[56ch] lg:col-span-7 lg:col-start-6">{c.honest}</p>
        </Reveal>
      </section>
    </>
  );
}
