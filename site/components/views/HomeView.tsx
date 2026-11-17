import Link from "next/link";
import { getCatalog } from "@/lib/catalog.server";
import { collectionHref, href, ROUTES, type Lang } from "@/lib/i18n";
import { chairAlt } from "@/lib/media";
import { countWord } from "@/lib/words";
import { ChairShowroom } from "../ChairShowroom";
import { CountUp } from "../CountUp";
import { FabricMarquee } from "../FabricMarquee";
import { HeroChair } from "../HeroChair";
import { Media } from "../Media";
import { Parallax } from "../Parallax";
import { Reveal } from "../Reveal";
import { SealHold } from "../SealHold";

const COPY = {
  tr: {
    discover: "Koleksiyonu keşfet",
    manifesto: [
      "Tahtırevan, sarayların ve İpek Yolu kervanlarının arasında sahibini taşıyan, yalnızca onun için yapılmış yürüyen bir tahttı.",
      "Aynı fikirle çalışıyoruz. Her parça tek bir kişi için, tek bir ustanın elinde, ilk kesimden son dikişe kadar yapılır.",
    ],
    featured: "Öne çıkan koleksiyon",
    seeCollection: "Koleksiyonu gör",
    pieces: "parça",
    craftLabel: "Zanaat",
    craftTitle: "Cesur desen, sessiz zanaat.",
    craftLine: "Desen gözü çeker. Gövdeyi taşıyan ise oyma, geçme ve elle bağlanan yaylardır.",
    craftShots: [
      ["macro", "Ceviz kolda el oyması"],
      ["craft", "Yay bağlayan eller"],
      ["macro", "Pervazda el dikişi"],
    ],
    sealLabel: "Numaralı ve imzalı",
    sealTitle: "Her parça bir numara ve bir imza taşır.",
    codesLabel: "Desen kodları",
    codesTitle: (codes: number) => `${countWord(codes, "tr", true)} dünya.`,
    codesLine: (fabrics: number, codes: number) =>
      `${countWord(fabrics, "tr", true)} kumaş, ${countWord(codes, "tr")} kod. Her kod kendi rengini ve kendi hikâyesini taşır.`,
    seePatterns: "Desenleri gör",
    bespokeTitle: "Her Tahtırevan sahibine göre yapılır.",
    bespokeLine: "Ölçüsü odanıza, kumaşı zevkinize, ahşabı elinize göre. İlk adım bir görüşmedir.",
    bespokeCta: "Özel görüşme talep edin",
    bespokeMore: "Süreci inceleyin",
  },
  en: {
    discover: "Discover the collection",
    manifesto: [
      "A tahtırevan was a walking throne. It carried its owner through palace gates and along the Silk Road, and it was built for that one person alone.",
      "We work from the same idea. Every piece is made for one owner, by one master, from the first cut to the last stitch.",
    ],
    featured: "Featured collection",
    seeCollection: "View the collection",
    pieces: "pieces",
    craftLabel: "Craft",
    craftTitle: "Bold pattern, quiet craft.",
    craftLine: "The pattern catches the eye. What carries the piece is carving, joinery and springs tied by hand.",
    craftShots: [
      ["macro", "Hand carving on a walnut arm"],
      ["craft", "Hands tying the springs"],
      ["macro", "Hand stitching along the welt"],
    ],
    sealLabel: "Numbered and signed",
    sealTitle: "Every piece carries a number and a signature.",
    codesLabel: "Pattern codes",
    codesTitle: (codes: number) => `${countWord(codes, "en", true)} worlds.`,
    codesLine: (fabrics: number, codes: number) =>
      `${countWord(fabrics, "en", true)} fabrics, ${countWord(codes, "en")} codes. Each code carries its own colour and its own story.`,
    seePatterns: "See the patterns",
    bespokeTitle: "Made for its owner, and no one else.",
    bespokeLine: "Sized to your room, dressed to your taste, finished in the wood you choose. It begins with a conversation.",
    bespokeCta: "Request a private consultation",
    bespokeMore: "See how it works",
  },
};

export async function HomeView({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  const cat = await getCatalog();
  const { collections, fabrics, getFabric, codes: patternCodes, piecesByCollection, getCode, site: siteData } = cat;
  const featured = collections.find((col) => col.featured) ?? collections[0];
  const featuredCode = getCode(featured.code);
  const featuredPieces = piecesByCollection(featured.id);
  const heroFabric = getFabric(featuredPieces[0]?.fabric ?? "");
  const rossaria = getFabric(siteData.hero.fabric);
  const codeHref = (codeId: string) => `${ROUTES.patterns[lang]}#${getCode(codeId).slug[lang]}`;
  // Daire konumları tasarımın parçası (kodda); hangi kumaşların görüneceği site ayarlarından gelir.
  const ORB_SLOTS = [
    { x: -31, y: -20, size: 128, depth: 1.2 },
    { x: 32, y: -24, size: 104, depth: 0.8 },
    { x: -35, y: 17, size: 92, depth: 1.6 },
    { x: 36, y: 14, size: 136, depth: 1 },
  ];
  const orbs = siteData.hero.orbs.slice(0, ORB_SLOTS.length).map((id, i) => {
    const f = getFabric(id);
    return { ...ORB_SLOTS[i], id: f.id, name: f.name, swatch: f.swatch, href: codeHref(f.code) };
  });

  return (
    <>
      {/* 1. Açılış: koltuk döner, yaklaşır ve kumaşın içine girer */}
      <HeroChair
        title="A throne, made for one."
        cta={c.discover}
        ctaHref={href(lang, "collections")}
        chairAlt={chairAlt(lang)}
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
            <svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="13" fill="none" stroke="currentColor" /></svg>
          </span>
          {c.manifesto.map((p, i) => (
            <p key={i} className={i === 0 ? "font-serif text-[1.75rem] font-light leading-[1.3] md:text-[2.6rem]" : "max-w-[52ch] text-tas"}>
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

      {/* 2c. Kumaş stüdyosu: 3B koltuk */}
      <ChairShowroom lang={lang} />

      {/* 3. Öne çıkan koleksiyon */}
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
              {featuredCode.name[lang]} · {featuredPieces.length} {c.pieces}
            </p>
            <Link href={collectionHref(lang, featured)} className="link-gold is-static label tap mt-6 !text-fildisi">
              {c.seeCollection}
            </Link>
          </Reveal>
        </div>
      </section>

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
              className={
                i === 0
                  ? "col-span-2 md:col-span-5"
                  : i === 1
                    ? "md:col-span-4 md:mt-24"
                    : "md:col-span-3 md:mt-48"
              }
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
              <h2 id="codes-title" className="display mt-4">{c.codesTitle(patternCodes.length)}</h2>
            </div>
            <p className="max-w-[40ch] text-tas md:col-span-5">{c.codesLine(fabrics.length, patternCodes.length)}</p>
          </Reveal>
        </div>
        <div>
          {patternCodes.map((code, i) => (
            <article key={code.id} className="sticky top-0 h-[100svh] min-h-[560px] w-full overflow-hidden" aria-labelledby={`code-${code.id}`}>
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
                <h3 id={`code-${code.id}`} className="display mt-3">{code.name[lang]}</h3>
                <p className="mt-4 max-w-[34ch] text-lg text-fildisi/90">{code.line[lang]}</p>
                <Link
                  href={`${ROUTES.patterns[lang]}#${code.slug[lang]}`}
                  className="link-gold is-static label tap mt-6 !text-fildisi"
                >
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
