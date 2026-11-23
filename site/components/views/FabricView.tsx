import Link from "next/link";
import { studyNumeral, type Fabric } from "@/lib/catalog";
import { getCatalog } from "@/lib/catalog.server";
import { fabricHref, href, pieceHref, ROUTES, type Lang } from "@/lib/i18n";
import { Media } from "../Media";
import { Reveal } from "../Reveal";
import { StudyFilm } from "../StudyFilm";

const COPY = {
  tr: {
    back: "Tüm kumaşlar",
    crumbs: "Konum",
    patterns: "Desenler",
    code: "Desen kodu",
    colors: "Renk notları",
    scale: "Ölçek",
    width: "En",
    widthValue: "145 cm",
    suits: "Uygun gövdeler",
    study: "Etüt",
    medium: "Dijital etüt",
    fabric: "Kumaş",
    state: "Durum",
    stateValue: "Henüz üretilmedi · siparişle yapılır",
    lead: "Termin",
    leadValue: "Çizim onayından itibaren ~12 hafta",
    studyCta: "Bu etüt için görüşme talep edin",
    noStudyTitle: "Bu kumaşla bir parça",
    noStudyLine: "Gövdeyi, ölçüyü ve desenin yerleşimini birlikte seçeriz. Her parça siparişle yapılır.",
    fabricCta: "Bu kumaşla görüşme talep edin",
    pieces: "Bu kumaşla yapılan parçalar",
    prev: "Önceki kumaş",
    next: "Sonraki kumaş",
  },
  en: {
    back: "All fabrics",
    crumbs: "Breadcrumb",
    patterns: "Patterns",
    code: "Pattern code",
    colors: "Colour notes",
    scale: "Scale",
    width: "Width",
    widthValue: "145 cm",
    suits: "Suited to",
    study: "Study",
    medium: "Digital study",
    fabric: "Fabric",
    state: "Status",
    stateValue: "Not yet made · made to order",
    lead: "Lead time",
    leadValue: "About 12 weeks from approved drawing",
    studyCta: "Request a consultation for this study",
    noStudyTitle: "A piece in this fabric",
    noStudyLine: "We choose the body, the size and the placement of the pattern together. Every piece is made to order.",
    fabricCta: "Request a consultation in this fabric",
    pieces: "Pieces made in this fabric",
    prev: "Previous fabric",
    next: "Next fabric",
  },
};

/** Kumaşın ana renginden, koyu zeminde hafif bir ışık (alfa ~%22). */
const glow = (hex = "#3a2c22") => `${hex}38`;

export async function FabricView({ lang, fabric }: { lang: Lang; fabric: Fabric }) {
  const c = COPY[lang];
  const { fabrics, getCode, studies: allStudies, studiesByFabric, piecesByFabric, typeLabel } = await getCatalog();
  const code = getCode(fabric.code);
  const studies = studiesByFabric(fabric.id);
  const made = piecesByFabric(fabric.id);
  const i = fabrics.findIndex((f) => f.id === fabric.id);
  const prev = fabrics[(i - 1 + fabrics.length) % fabrics.length];
  const next = fabrics[(i + 1) % fabrics.length];
  const consult = (q: string) => `${ROUTES.consultation[lang]}?${q}`;

  return (
    <>
      {/* Kumaş: tam ekran */}
      <section className="relative h-[86svh] min-h-[560px]">
        <Media
          lang={lang}
          shot="fabric"
          subject={`${fabric.name} · ${fabric.motif[lang]}`}
          colors={fabric.colors}
          fabric={fabric.id}
          className="absolute inset-0"
          labelPosition="top-right"
          sizes="100vw"
          priority
          cursor={false}
        />
        <div
          className="pointer-events-none absolute inset-[-2px]"
          style={{ background: "linear-gradient(to top, rgba(20,17,15,0.92) 0%, rgba(20,17,15,0.35) 42%, rgba(20,17,15,0) 66%)" }}
          aria-hidden="true"
        />
        {/* Okuma kuşağı üstte de: yol çizgisi görselin üstünde okunabilsin */}
        <div
          className="pointer-events-none absolute inset-x-[-2px] top-[-2px] h-[240px]"
          style={{ background: "linear-gradient(to bottom, rgba(20,17,15,0.9) 0%, rgba(20,17,15,0.75) 45%, rgba(20,17,15,0))" }}
          aria-hidden="true"
        />
        <nav aria-label={c.crumbs} className="absolute inset-x-0 top-[92px] px-[var(--gutter)] lg:top-[108px]">
          <ol className="label flex flex-wrap items-center gap-x-3 gap-y-1 !text-[10px] !text-fildisi/75">
            <li>
              <Link href={href(lang, "patterns")} className="link-gold tap">
                {c.patterns}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`${ROUTES.patterns[lang]}#${code.slug[lang]}`} className="link-gold tap">
                {code.name[lang]}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="!text-fildisi">
              {fabric.name}
            </li>
          </ol>
        </nav>
        <div className="absolute inset-x-0 bottom-0 px-[var(--gutter)] pb-[8svh]">
          <Link href={`${ROUTES.patterns[lang]}#${code.slug[lang]}`} className="link-gold is-static label tap !text-fildisi/80">
            {c.code} · {code.name[lang]}
          </Link>
          <h1 className="display mt-3">{fabric.name}</h1>
          <p className="mt-4 max-w-[40ch] text-lg text-fildisi/90">{fabric.motif[lang]}</p>
        </div>
      </section>

      {/* Künye */}
      <section className="px-[var(--gutter)] py-[10vh]">
        <Reveal>
          <dl className="grid gap-8 border-t hairline pt-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="label">{c.colors}</dt>
              <dd className="mt-2">{fabric.colorNotes[lang]}</dd>
            </div>
            <div>
              <dt className="label">{c.scale}</dt>
              <dd className="mt-2">{fabric.scale[lang]}</dd>
            </div>
            <div>
              <dt className="label">{c.width}</dt>
              <dd className="mt-2">{c.widthValue}</dd>
            </div>
            <div>
              <dt className="label">{c.suits}</dt>
              <dd className="mt-2">{fabric.suitableFor.map((t) => typeLabel(t, lang, true)).join(" · ")}</dd>
            </div>
          </dl>
        </Reveal>
      </section>

      {/* Etütler: galeri duvarı. Çerçeveli film + müze etiketi gibi künye; ışık kumaşın renginden gelir. */}
      {studies.map((s, si) => {
        const num = studyNumeral(allStudies.findIndex((x) => x.id === s.id) + 1);
        const flip = si % 2 === 1;
        return (
          <section
            key={s.id}
            id={`etut-${s.id}`}
            aria-labelledby={`study-${s.id}`}
            className="relative scroll-mt-0 overflow-hidden py-[12vh] lg:py-[16vh]"
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(55% 60% at ${flip ? "70%" : "30%"} 50%, ${glow(fabric.colors[0])} 0%, transparent 70%)`,
              }}
              aria-hidden="true"
            />
            <div className="relative grid items-center gap-12 px-[var(--gutter)] lg:grid-cols-12 lg:gap-0">
              <Reveal
                as="figure"
                className={`w-full lg:col-span-5 lg:mx-auto lg:max-w-[calc((100svh-150px)*0.72)] ${flip ? "lg:order-2 lg:col-start-7" : "lg:col-start-2"}`}
              >
                <div className="border border-altin/25 bg-[#1b1612] p-[clamp(12px,2vw,26px)] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)]">
                  <StudyFilm
                    image={s.image}
                    video={s.video}
                    alt={s.image.alt?.[lang] || `${s.name[lang]} · ${fabric.name}`}
                    sizes="(min-width: 1024px) 38vw, 100vw"
                    className="aspect-[3/4] w-full"
                  />
                </div>
                <figcaption className="mt-4 flex items-baseline justify-between gap-4">
                  <span className="label !text-[10px]">
                    {c.study} {num} · {s.name[lang]}
                  </span>
                  <span className="label !text-[10px] !text-tas/70">{c.medium}</span>
                </figcaption>
              </Reveal>

              <Reveal className={`lg:col-span-4 ${flip ? "lg:order-1 lg:col-start-2" : "lg:col-start-8"}`} delay={0.15}>
                <p className="font-serif text-[4.5rem] font-light leading-none text-altin/80 lg:text-[6rem]" aria-hidden="true">
                  {num}
                </p>
                <p className="label mt-6">{c.study}</p>
                <h2 id={`study-${s.id}`} className="display-md mt-3">
                  {s.name[lang]}
                </h2>
                <p className="mt-6 max-w-[38ch] text-lg leading-relaxed text-fildisi/90">{s.line[lang]}</p>
                <dl className="mt-10 grid gap-4 border-t hairline pt-6 text-[15px]">
                  <div className="flex items-baseline justify-between gap-6">
                    <dt className="label !text-[10px]">{c.fabric}</dt>
                    <dd>{fabric.name}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-6">
                    <dt className="label !text-[10px]">{c.state}</dt>
                    <dd className="text-right">{c.stateValue}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-6">
                    <dt className="label !text-[10px]">{c.lead}</dt>
                    <dd>{c.leadValue}</dd>
                  </div>
                </dl>
                <Link href={consult(`etut=${s.id}&kumas=${fabric.id}`)} className="link-gold is-static label tap mt-10 inline-block !text-fildisi">
                  {c.studyCta}
                </Link>
              </Reveal>
            </div>
          </section>
        );
      })}

      {/* Etüt yoksa: kumaşla görüşme çağrısı */}
      {studies.length === 0 && (
        <section className="px-[var(--gutter)] pb-[14vh]">
          <Reveal className="grid gap-8 lg:grid-cols-12">
            <h2 className="display-sm lg:col-span-4">{c.noStudyTitle}</h2>
            <div className="lg:col-span-6 lg:col-start-6">
              <p className="lede max-w-[46ch] !text-tas">{c.noStudyLine}</p>
              <Link href={consult(`kumas=${fabric.id}`)} className="btn mt-10">
                {c.fabricCta}
              </Link>
            </div>
          </Reveal>
        </section>
      )}

      {made.length > 0 && (
        <section className="px-[var(--gutter)] pb-[12vh]">
          <div className="flex flex-col gap-4 border-t hairline pt-8 md:flex-row md:items-baseline md:gap-10">
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
        </section>
      )}

      {/* Kumaşlar arasında gezinme */}
      <nav aria-label={c.back} className="border-t hairline px-[var(--gutter)] py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-baseline sm:justify-between">
          <Link href={fabricHref(lang, prev.id)} className="link-gold tap font-serif text-2xl">
            <span className="label mr-3 !text-[10px]">{c.prev}</span>
            {prev.name}
          </Link>
          <Link href={href(lang, "patterns")} className="link-gold is-static label tap !text-fildisi">
            {c.back}
          </Link>
          <Link href={fabricHref(lang, next.id)} className="link-gold tap font-serif text-2xl sm:text-right">
            <span className="label mr-3 !text-[10px]">{c.next}</span>
            {next.name}
          </Link>
        </div>
      </nav>
    </>
  );
}
