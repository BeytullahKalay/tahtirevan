import Link from "next/link";
import { getCatalog } from "@/lib/catalog.server";
import { collectionHref, fabricHref, href, ROUTES, type Lang } from "@/lib/i18n";
import { CountUp } from "../CountUp";
import { CraftMarks } from "../CraftMarks";
import { FabricMarquee } from "../FabricMarquee";
import { HeroCard } from "../HeroCard";
import { Media } from "../Media";
import { Parallax } from "../Parallax";
import { Reveal } from "../Reveal";
import { RoadStops } from "../RoadStops";
import { roadStops } from "@/lib/road";
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
    allStudies: "Tüm etütleri görün",
    studiesTitle: "Kumaştan gövdeye.",
    studiesLine: "Kumaşlarımızla düşünülmüş, henüz üretilmemiş gövdeler. Her biri siparişle, sizin ölçünüzde yapılabilir.",
    seeFabric: "Kumaşı ve etüdü gör",
    pieces: "parça",
    craftLabel: "Zanaat",
    craftTitle: "Cesur desen, sessiz zanaat.",
    craftLine: "Desen gözü çeker. Parçayı Tahtırevan yapan ise üç imzadır: nakış, püskül ve pirinç damga.",
    sealLabel: "Numaralı",
    sealTitle: "Her parça bir numara taşır. Bir numara ikinci kez verilmez.",
    roadLabel: "Yol ve duraklar",
    roadTitle: "Her koleksiyon bir durak.",
    roadLine:
      "Anadolu bir kumaş kavşağıydı: İpek Yolu'ndan, limanlardan ve saraylardan gelen desenler burada buluştu. Koleksiyonlarımız bu yolun duraklarıdır. Yol, kuruluş serisiyle başlıyor.",
    roadMore: "Hikâyeyi okuyun",
    road: { stop: "Durak", start: "Başlangıç", next: "Sıradaki durak", nextLine: "Yolun devamı", see: "Koleksiyonu gör" },
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
    allStudies: "See all studies",
    studiesTitle: "From fabric to form.",
    studiesLine: "Bodies imagined in our fabrics, not yet made. Each can be made to order, to your measurements.",
    seeFabric: "See the fabric and the study",
    pieces: "pieces",
    craftLabel: "Craft",
    craftTitle: "Bold pattern, quiet craft.",
    craftLine: "The pattern catches the eye. What makes the piece a Tahtırevan are three marks: embroidery, a tassel and a brass seal.",
    sealLabel: "Numbered",
    sealTitle: "Every piece carries a number. No number is ever given twice.",
    roadLabel: "The road and its stops",
    roadTitle: "Every collection, a stop.",
    roadLine:
      "Anatolia was a crossroads of cloth: patterns from the Silk Road, the ports and the palaces met here. Our collections are the stops along that road. The road begins with the founding series.",
    roadMore: "Read the story",
    road: { stop: "Stop", start: "The beginning", next: "The next stop", nextLine: "The road goes on", see: "See the collection" },
    bespokeTitle: "Made for its owner, and no one else.",
    bespokeLine: "Sized to your room, dressed to your taste. It begins with a conversation.",
    bespokeCta: "Request a private consultation",
    bespokeMore: "See how it works",
  },
};

export async function HomeView({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  const cat = await getCatalog();
  const { collections, fabrics, getFabric, piecesByCollection, getCode, studies, site: siteData } = cat;
  // Öne çıkan koleksiyon yalnızca yayında parçası varsa gösterilir; yoksa yerine etütler gelir.
  const withPieces = collections.filter((col) => piecesByCollection(col.id).length > 0);
  const featured = withPieces.find((col) => col.featured) ?? withPieces[0];
  const featuredPieces = featured ? piecesByCollection(featured.id) : [];
  const heroFabric = getFabric(featuredPieces[0]?.fabric ?? "");
  // Ana sayfada yalnızca panelde "Ana sayfada göster" işaretli etütler (en çok 3, paneldeki sırayla);
  // hiçbiri işaretli değilse ilk üç etüt.
  const picked = studies.filter((s) => s.featured);
  const homeStudies = (picked.length ? picked : studies).slice(0, 3);
  const codeHref = (codeId: string) => `${ROUTES.patterns[lang]}#${getCode(codeId).slug[lang]}`;
  // Amblemin içini döşeyen kumaşlar: site ayarlarındaki "açılış kumaşları", sırayla.
  const heroFabrics = siteData.hero.orbs.slice(0, 4).map((id) => {
    const f = getFabric(id);
    return { id: f.id, name: f.name, tile: f.tile, href: fabricHref(lang, f.id) };
  });

  return (
    <>
      {/* 1. Açılış: kartvizitin diliyle, kumaşla döşenmiş altın amblem */}
      <HeroCard
        title={lang === "tr" ? "Bir taht, tek bir kişi için." : "A throne, made for one."}
        cta={c.discover}
        ctaHref={href(lang, "patterns")}
        fabrics={heroFabrics}
        fabricLabel={lang === "tr" ? "Kumaş" : "Fabric"}
        scrollHint={lang === "tr" ? "Kaydır" : "Scroll"}
      />

      {/* 2. Manifesto */}
      <section className="px-[var(--gutter)] py-[22vh] text-center">
        <Reveal className="mx-auto flex max-w-[980px] flex-col items-center gap-8">
          {/* Küçük amblem (logodaki tahtırevan) */}
          <span className="text-altin" aria-hidden="true">
            <svg width="34" height="34" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M32 3.5C34.2 6 34.4 8.2 32 10.6C29.6 8.2 29.8 6 32 3.5Z" fill="currentColor" stroke="none" />
              <path d="M19.5 57V31C19.5 24.6 23.4 21.6 27.6 18.8C30 17.2 31.4 15.4 32 12.8C32.6 15.4 34 17.2 36.4 18.8C40.6 21.6 44.5 24.6 44.5 31V57" strokeWidth="2.2" />
              <path d="M19.5 44H44.5" strokeWidth="1.8" />
              <path d="M10 50.5H54" strokeWidth="2.4" />
              <circle cx="6.6" cy="50.5" r="2.2" fill="currentColor" stroke="none" />
              <circle cx="57.4" cy="50.5" r="2.2" fill="currentColor" stroke="none" />
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
            <div className="md:col-span-5">
              <p className="max-w-[42ch] text-tas">{c.studiesLine}</p>
              <Link href={href(lang, "studies")} className="link-gold is-static label tap mt-6 inline-block !text-fildisi">
                {c.allStudies}
              </Link>
            </div>
          </Reveal>
          <ul className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-3">
            {homeStudies.map((s, i) => {
              const f = getFabric(s.fabric);
              return (
                <Reveal as="li" key={s.id} delay={i * 0.12} className={i === 1 ? "sm:mt-24" : ""}>
                  <Link href={`${fabricHref(lang, f.id)}#etut-${s.id}`} className="group block" data-cursor="explore">
                    <div className="relative border border-altin/25 bg-[#1b1612] p-[clamp(10px,1.4vw,18px)] transition-colors duration-700 group-hover:border-altin/60">
                      {/* Kartın boyalı kenarı */}
                      <span aria-hidden="true" className="absolute inset-x-[-1px] bottom-[-1px] h-[3px] bg-lal" />
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

        {/* Üç imza, kartvizitteki gibi kartlar üzerinde çizimle (gerçek fotoğraflar gelince değişebilir) */}
        <CraftMarks lang={lang} />

        <dl className="mt-24 grid gap-12 border-t hairline pt-12 md:grid-cols-3">
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

      {/* 5. Yol ve duraklar: markanın ana hikâyesi (eskiden dört desen kodu vardı) */}
      <section aria-labelledby="road-title" className="px-[var(--gutter)] py-[16vh]">
        <Reveal className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="label">{c.roadLabel}</p>
            <h2 id="road-title" className="display mt-4 max-w-[12ch]">
              {c.roadTitle}
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className="max-w-[44ch] text-tas">{c.roadLine}</p>
            <Link href={href(lang, "story")} className="link-gold is-static label tap mt-6 inline-block !text-fildisi">
              {c.roadMore}
            </Link>
          </div>
        </Reveal>
        <RoadStops
          stops={roadStops(lang, collections, getFabric, siteData.hero.orbs, c.road)}
          upcoming={Math.max(1, 4 - collections.length)}
          stopWord={c.road.stop}
          next={c.road.next}
          nextLine={c.road.nextLine}
          see={c.road.see}
        />
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
