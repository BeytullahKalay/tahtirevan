import Link from "next/link";
import { getCatalog } from "@/lib/catalog.server";
import { collectionHref, fabricHref, href, ROUTES, type Lang } from "@/lib/i18n";
import { countWord } from "@/lib/words";
import { CountUp } from "../CountUp";
import { FabricMarquee } from "../FabricMarquee";
import { HeroChair } from "../HeroChair";
import { Media } from "../Media";
import { Parallax } from "../Parallax";
import { Reveal } from "../Reveal";
import { SealHold } from "../SealHold";
import { StudyFilm } from "../StudyFilm";
import { studyNumeral } from "@/lib/catalog";

const COPY = {
  tr: {
    discover: "Kumaşları ve etütleri keşfet",
    manifesto: [
      "Tahtırevan, sarayların ve İpek Yolu kervanlarının arasında sahibini taşıyan, yalnızca onun için yapılmış yürüyen bir tahttı.",
      "Aynı fikirle çalışıyoruz. Her parça tek bir kişi için, siparişle yapılır. Kumaşı birlikte seçer, gövdeyi birlikte çizer, döşemeyi ustaların elinde kurarız.",
    ],
    featured: "Öne çıkan koleksiyon",
    seeCollection: "Koleksiyonu gör",
    studiesLabel: "Etütler",
    studyWord: "Etüt",
    studiesTitle: "Kumaştan gövdeye.",
    studiesLine: "Kumaşlarımızla düşünülmüş, henüz üretilmemiş gövdeler. Her biri siparişle, sizin ölçünüzde yapılabilir.",
    seeFabric: "Kumaşı ve etüdü gör",
    pieces: "parça",
    craftLabel: "Zanaat",
    craftTitle: "Cesur desen, sessiz zanaat.",
    craftLine: "Desen gözü çeker. Parçayı Tahtırevan yapan ise üç imzadır: nakış, püskül ve pirinç damga.",
    craftShots: [
      ["macro", "Desenin üstüne işlenen nakış"],
      ["craft", "Püskülün bağlanışı"],
      ["macro", "Pirinç damga"],
    ],
    sealLabel: "Numaralı",
    sealTitle: "Her parça bir numara taşır. Bir numara ikinci kez verilmez.",
    codesLabel: "Desen kodları",
    codesTitle: (codes: number) => `${countWord(codes, "tr", true)} dünya.`,
    codesLine: (fabrics: number, codes: number) =>
      `${countWord(fabrics, "tr", true)} kumaş, ${countWord(codes, "tr")} kod. Her kod kendi rengini ve kendi hikâyesini taşır.`,
    seePatterns: "Desenleri gör",
    bespokeTitle: "Her Tahtırevan sahibine göre yapılır.",
    bespokeLine: "Ölçüsü odanıza, kumaşı zevkinize göre. İlk adım bir görüşmedir.",
    bespokeCta: "Özel görüşme talep edin",
    bespokeMore: "Süreci inceleyin",
  },
  en: {
    discover: "Discover the fabrics and studies",
    manifesto: [
      "A tahtırevan was a walking throne. It carried its owner through palace gates and along the Silk Road, and it was built for that one person alone.",
      "We work from the same idea. Every piece is made to order, for one owner. We choose the fabric together, draw the body together, and the upholstery is built by a master's hands.",
    ],
    featured: "Featured collection",
    seeCollection: "View the collection",
    studiesLabel: "Studies",
    studyWord: "Study",
    studiesTitle: "From fabric to form.",
    studiesLine: "Bodies imagined in our fabrics, not yet made. Each can be made to order, to your measurements.",
    seeFabric: "See the fabric and the study",
    pieces: "pieces",
    craftLabel: "Craft",
    craftTitle: "Bold pattern, quiet craft.",
    craftLine: "The pattern catches the eye. What makes the piece a Tahtırevan are three marks: embroidery, a tassel and a brass seal.",
    craftShots: [
      ["macro", "Embroidery worked over the pattern"],
      ["craft", "Tying the tassel"],
      ["macro", "The brass seal"],
    ],
    sealLabel: "Numbered",
    sealTitle: "Every piece carries a number. No number is ever given twice.",
    codesLabel: "Pattern codes",
    codesTitle: (codes: number) => `${countWord(codes, "en", true)} worlds.`,
    codesLine: (fabrics: number, codes: number) =>
      `${countWord(fabrics, "en", true)} fabrics, ${countWord(codes, "en")} codes. Each code carries its own colour and its own story.`,
    seePatterns: "See the patterns",
    bespokeTitle: "Made for its owner, and no one else.",
    bespokeLine: "Sized to your room, dressed to your taste. It begins with a conversation.",
    bespokeCta: "Request a private consultation",
    bespokeMore: "See how it works",
  },
};

export async function HomeView({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  const cat = await getCatalog();
  const { collections, fabrics, getFabric, codes: patternCodes, piecesByCollection, getCode, studies, site: siteData } = cat;
  // Öne çıkan koleksiyon yalnızca yayında parçası varsa gösterilir; yoksa yerine etütler gelir.
  const withPieces = collections.filter((col) => piecesByCollection(col.id).length > 0);
  const featured = withPieces.find((col) => col.featured) ?? withPieces[0];
  const featuredPieces = featured ? piecesByCollection(featured.id) : [];
  const heroFabric = getFabric(featuredPieces[0]?.fabric ?? "");
  // Ana sayfada yalnızca panelde "Ana sayfada göster" işaretli etütler (en çok 3, paneldeki sırayla);
  // hiçbiri işaretli değilse ilk üç etüt.
  const picked = studies.filter((s) => s.featured);
  const homeStudies = (picked.length ? picked : studies).slice(0, 3);
  const rossaria = getFabric(siteData.hero.fabric);
  const codeHref = (codeId: string) => `${ROUTES.patterns[lang]}#${getCode(codeId).slug[lang]}`;
  // Daire konumları tasarımın parçası (kodda); hangi kumaşların görüneceği site ayarlarından gelir.
  const ORB_SLOTS = [
    // Telefonda yalnızca üstteki iki daire görünür (başlığa binmesin)
    { x: -31, y: -20, size: 128, depth: 1.2, mobile: true },
    { x: 32, y: -24, size: 104, depth: 0.8, mobile: true },
    { x: -35, y: 17, size: 92, depth: 1.6 },
    { x: 36, y: 14, size: 136, depth: 1 },
  ];
  const orbs = siteData.hero.orbs.slice(0, ORB_SLOTS.length).map((id, i) => {
    const f = getFabric(id);
    return { ...ORB_SLOTS[i], id: f.id, name: f.name, swatch: f.swatch, href: codeHref(f.code) };
  });

  return (
    <>
      {/* 1. Açılış: başlık ve kumaş daireleri; kaydırınca kumaşın içine girilir */}
      <HeroChair
        title={lang === "tr" ? "Bir taht, tek bir kişi için." : "A throne, made for one."}
        cta={c.discover}
        ctaHref={href(lang, "patterns")}
        fabric={{
          id: rossaria.id,
          name: rossaria.name,
          code: `${lang === "tr" ? "Desen kodu" : "Pattern code"} · ${getCode(rossaria.code).name[lang]}`,
          motif: rossaria.motif[lang],
          image: rossaria.image.src,
        }}
        orbs={orbs}
        scrollHint={lang === "tr" ? "Kaydır" : "Scroll"}
      />

      {/* 2. Manifesto */}
      <section className="px-[var(--gutter)] py-[22vh] text-center">
        <Reveal className="mx-auto flex max-w-[980px] flex-col items-center gap-8">
          <span className="text-altin" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28">
              <circle cx="14" cy="14" r="13" fill="none" stroke="currentColor" />
            </svg>
          </span>
          {c.manifesto.map((p, i) => (
            <p
              key={i}
              className={i === 0 ? "font-serif text-[1.75rem] font-light leading-[1.3] md:text-[2.6rem]" : "max-w-[52ch] text-tas"}
            >
              {p}
            </p>
          ))}
        </Reveal>
      </section>

      {/* 2b. Kumaş şeridi: kaydırma hızıyla akar */}
      <FabricMarquee
        label={lang === "tr" ? "Kumaş kütüphanesi" : "Fabric library"}
        items={fabrics.map((f) => ({ id: f.id, name: f.name, code: getCode(f.code).name[lang], href: codeHref(f.code), tile: f.tile }))}
      />

      {/* 3. Öne çıkan koleksiyon (yayında parçası varsa) */}
      {featured && (
        <section className="px-[var(--gutter)] pb-[18vh]">
          <div className="grid items-end gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-8">
              <Link href={collectionHref(lang, featured)} className="block" data-cursor="explore">
                <Parallax className="aspect-[4/5] w-full sm:aspect-[16/11]" amount={70}>
                  <Media
                    lang={lang}
                    shot="space"
                    subject={`${featuredPieces[0]?.name ?? featured.name[lang]}, ${heroFabric.name} · ${lang === "tr" ? "taş konakta" : "in a stone mansion"}`}
                    colors={heroFabric.colors}
                    fabric={heroFabric.id}
                    photo={featuredPieces[0]?.photo}
                    className="absolute inset-0"
                    cursor={false}
                    sizes="(min-width: 1024px) 66vw, 100vw"
                  />
                </Parallax>
              </Link>
            </Reveal>
            <Reveal className="lg:col-span-4 lg:pb-8" delay={0.15}>
              <p className="label">{c.featured}</p>
              <h2 className="display-md mt-4">{featured.name[lang]}</h2>
              <p className="mt-5 max-w-[36ch] text-tas">{featured.line[lang]}</p>
              <p className="label mt-8">
                {featured.stop[lang] ? `${featured.stop[lang]} · ` : ""}
                {featuredPieces.length} {c.pieces}
              </p>
              <Link href={collectionHref(lang, featured)} className="link-gold is-static label tap mt-6 !text-fildisi">
                {c.seeCollection}
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* 3b. Etütler: kumaşla düşünülmüş gövdeler */}
      {!featured && homeStudies.length > 0 && (
        <section aria-labelledby="studies-title" className="px-[var(--gutter)] pb-[18vh]">
          <Reveal className="grid gap-6 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="label">{c.studiesLabel}</p>
              <h2 id="studies-title" className="display-md mt-4">
                {c.studiesTitle}
              </h2>
            </div>
            <p className="max-w-[42ch] text-tas md:col-span-5">{c.studiesLine}</p>
          </Reveal>
          <ul className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-3">
            {homeStudies.map((s, i) => {
              const f = getFabric(s.fabric);
              return (
                <Reveal as="li" key={s.id} delay={i * 0.12} className={i === 1 ? "sm:mt-24" : ""}>
                  <Link href={fabricHref(lang, f.id)} className="group block" data-cursor="explore">
                    <div className="border border-altin/25 bg-[#1b1612] p-[clamp(10px,1.4vw,18px)] transition-colors duration-700 group-hover:border-altin/60">
                      <StudyFilm
                        image={s.image}
                        alt={s.image.alt?.[lang] || `${s.name[lang]} · ${f.name}`}
                        sizes="(min-width: 640px) 30vw, 100vw"
                        className="zoomable aspect-[3/4] w-full"
                      />
                    </div>
                    <p className="label mt-5 !text-[10px]">
                      {c.studyWord} {studyNumeral(studies.findIndex((x) => x.id === s.id) + 1)} · {f.name}
                    </p>
                    <h3 className="mt-2 font-serif text-3xl font-light leading-none">
                      <span className="link-gold">{s.name[lang]}</span>
                    </h3>
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        </section>
      )}

      {/* 4. Zanaat şeridi */}
      <section className="bg-ceviz/40 px-[var(--gutter)] py-[16vh]">
        <Reveal className="max-w-[760px]">
          <p className="label">{c.craftLabel}</p>
          <h2 className="display-md mt-4">{c.craftTitle}</h2>
          <p className="mt-6 max-w-[48ch] text-tas">{c.craftLine}</p>
        </Reveal>

        <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-12 md:gap-6">
          {c.craftShots.map(([shot, subject], i) => (
            <Reveal
              key={subject}
              delay={i * 0.12}
              className={i === 0 ? "col-span-2 md:col-span-5" : i === 1 ? "md:col-span-4 md:mt-24" : "md:col-span-3 md:mt-48"}
            >
              <Media
                lang={lang}
                shot={shot as "macro" | "craft"}
                subject={subject}
                colors={i === 1 ? ["#5a3a24"] : ["#4a3424"]}
                detail={i}
                className={i === 0 ? "aspect-[4/3] w-full md:aspect-[4/5]" : "aspect-[3/4] w-full"}
                sizes="(min-width: 768px) 40vw, 50vw"
              />
            </Reveal>
          ))}
        </div>

        <dl className="mt-20 grid gap-12 border-t hairline pt-12 md:grid-cols-3">
          {siteData.craftNumbers.map((n, i) => (
            <Reveal key={n.value} delay={i * 0.12}>
              <dt className="nums font-serif text-[4.5rem] font-light leading-none text-fildisi md:text-[6rem]">
                <CountUp value={n.value} />
              </dt>
              <dd className="mt-3 max-w-[30ch] text-tas">{n[lang]}</dd>
            </Reveal>
          ))}
        </dl>

        <div className="mt-28 grid items-center gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="label">{c.sealLabel}</p>
            <h3 className="display-sm mt-4 max-w-[18ch]">{c.sealTitle}</h3>
          </Reveal>
          <Reveal className="lg:col-span-7" delay={0.15}>
            <SealHold lang={lang} />
          </Reveal>
        </div>
      </section>

      {/* 5. Desen kodları: sitenin en renkli anı */}
      <section aria-labelledby="codes-title">
        <div className="px-[var(--gutter)] py-[16vh]">
          <Reveal className="grid gap-6 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="label">{c.codesLabel}</p>
              <h2 id="codes-title" className="display mt-4">
                {c.codesTitle(patternCodes.length)}
              </h2>
            </div>
            <p className="max-w-[40ch] text-tas md:col-span-5">{c.codesLine(fabrics.length, patternCodes.length)}</p>
          </Reveal>
        </div>
        <div>
          {patternCodes.map((code, i) => (
            <article
              key={code.id}
              className="sticky top-0 h-[100svh] min-h-[560px] w-full overflow-hidden"
              aria-labelledby={`code-${code.id}`}
            >
              <Media
                lang={lang}
                shot="fabric"
                subject={`${code.name[lang]} · ${lang === "tr" ? "kumaş yakın çekim" : "fabric close-up"}`}
                colors={code.colors}
                fabric={code.lead}
                className="absolute inset-0"
                labelPosition="top-right"
                sizes="100vw"
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(20,17,15,0.88) 0%, rgba(20,17,15,0.35) 38%, rgba(20,17,15,0) 62%)" }}
                aria-hidden="true"
              />
              <div className="absolute inset-x-0 bottom-0 px-[var(--gutter)] pb-[10svh]">
                <p className="label !text-fildisi/80">
                  {String(i + 1).padStart(2, "0")} / {String(patternCodes.length).padStart(2, "0")}
                </p>
                <h3 id={`code-${code.id}`} className="display mt-3">
                  {code.name[lang]}
                </h3>
                <p className="mt-4 max-w-[34ch] text-lg text-fildisi/90">{code.line[lang]}</p>
                <Link href={`${ROUTES.patterns[lang]}#${code.slug[lang]}`} className="link-gold is-static label tap mt-6 !text-fildisi">
                  {c.seePatterns}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 6. Size özel çağrısı */}
      <section className="relative z-10 bg-gece px-[var(--gutter)] py-[24vh] text-center">
        <Reveal className="mx-auto flex max-w-[1100px] flex-col items-center">
          <h2 className="display max-w-[16ch]">{c.bespokeTitle}</h2>
          <p className="mt-8 max-w-[46ch] text-tas">{c.bespokeLine}</p>
          <div className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
            <Link href={href(lang, "consultation")} className="btn">
              {c.bespokeCta}
            </Link>
            <Link href={href(lang, "bespoke")} className="link-gold label tap !text-fildisi">
              {c.bespokeMore}
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
