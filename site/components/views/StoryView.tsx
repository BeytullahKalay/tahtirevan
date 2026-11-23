import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { getCatalog } from "@/lib/catalog.server";
import type { Fabric } from "@/lib/catalog";
import { href, type Lang } from "@/lib/i18n";
import { roadStops } from "@/lib/road";
import { Media } from "../Media";
import { Reveal } from "../Reveal";
import { RoadMark, StoryRoad } from "../StoryRoad";

type Stop = { city: string; motif: string; text: string; fabric?: string };

// Hikâye: desenlerin yolu. Her desen bir yoldan geldi, yollar Anadolu'da buluştu,
// bugün bir koltukta duruyor; yolun sıradaki durağı okuyanın projesi.
// Tasarım: docs/superpowers/specs/2026-11-23-hikaye-desenlerin-yolu-design.md
const COPY = {
  tr: {
    label: "Hikâye",
    title: "Her desen bir yoldan geldi.",
    sub: "Ve bütün yollar Anadolu'dan geçti.",
    stops: [
      { city: "Şam", motif: "Damask", fabric: "sapphire", text: "Kumaşa dokunan desene bugün hâlâ şehrin adıyla, damask diyoruz." },
      { city: "İran", motif: "Buta", fabric: "soraya", text: "Bir damla, bir alev, bir tohum. Buta İran'dan çıktı, şallarda dünyayı dolaştı." },
      { city: "Bozkır", motif: "At", fabric: "ardente", text: "Bozkırın sanatında hayvan bir süs değildi; koşan, bakan bir figürdü." },
    ] as Stop[],
    crossroads: {
      label: "Anadolu",
      title: "Bütün yollar Anadolu'da buluştu.",
      text: "Desenleri kervanlar taşıdı. Hükümdarları, saray kadınlarını ve uzun yola çıkan büyükleri ise tahtırevan: iki hayvanın ya da omuzların taşıdığı, perdeli bir oturak. Adı da bunu söyler: taht ve revan, yürüyen taht.",
      fabric: "zafran",
    },
    today: {
      label: "Bugün",
      title: "Yol bir koltukta durur.",
      text: "Her tahtırevan sahibine göre yapılırdı. Biz de öyle yapıyoruz: seri üretim yok, stok yok. Her parça tek bir kişi için başlar, sahibini bir ömür boyu taşımak için yapılır ve hikâyesini üç imzada taşır: nakış, püskül ve pirinç damga. Kumaşlarımız ailemizin kumaş geleneğinden gelir.",
    },
    road: { intro: "Koleksiyonlarımız bu yolun duraklarıdır.", stop: "Durak", start: "Başlangıç", see: "Koleksiyonu gör" },
    invite: {
      title: "Yolun bir sonraki durağı, sizin projeniz.",
      sub: "Kumaşları birlikte inceleyelim.",
      cta: "Görüşme talep edin",
      how: "Nasıl çalıştığımız",
    },
  },
  en: {
    label: "Story",
    title: "Every pattern came by a road.",
    sub: "And every road passed through Anatolia.",
    stops: [
      { city: "Damascus", motif: "Damask", fabric: "sapphire", text: "We still call a pattern woven into cloth by the city's name: damask." },
      { city: "Iran", motif: "Buta", fabric: "soraya", text: "A drop, a flame, a seed. The buta set out from Iran and travelled the world on shawls." },
      { city: "The Steppe", motif: "The horse", fabric: "ardente", text: "In the art of the steppe an animal was no ornament; it was a figure that ran and looked." },
    ] as Stop[],
    crossroads: {
      label: "Anatolia",
      title: "Every road met in Anatolia.",
      text: "Caravans carried the patterns. Rulers, palace women and great travellers rode in a tahtırevan: a curtained seat carried between two animals or on shoulders. The name says it plainly: taht, the throne, and revan, the one that moves. A walking throne.",
      fabric: "zafran",
    },
    today: {
      label: "Today",
      title: "The road comes to rest in a chair.",
      text: "Every tahtırevan was made for its owner. So is every piece of ours: no series, no stock. Each one begins with a single person, is made to carry its owner for a lifetime, and tells its story in three signatures: embroidery, tassel and brass seal. Our fabrics come from our family's long trade in cloth.",
    },
    road: { intro: "Our collections are the stops along this road.", stop: "Stop", start: "The beginning", see: "See the collection" },
    invite: {
      title: "The next stop on the road is your project.",
      sub: "Let's look at the fabrics together.",
      cta: "Request a consultation",
      how: "How we work",
    },
  },
};

/** Çizginin sağına itilen durak satırı; işaret başlık hizasında. */
function Row({ mark, children, className = "" }: { mark?: "sm" | "lg"; children: ReactNode; className?: string }) {
  return (
    <div className={`relative pl-[calc(var(--road-x)+2rem)] pr-[var(--gutter)] lg:pl-[calc(var(--road-x)+3.5rem)] ${className}`}>
      {mark && <RoadMark size={mark} className={mark === "lg" ? "mt-[0.35rem]" : "mt-[0.3rem]"} />}
      {children}
    </div>
  );
}

function FabricShot({ lang, fabric, wide, tall }: { lang: Lang; fabric: Fabric; wide?: boolean; tall?: boolean }) {
  return (
    <>
      <Media
        lang={lang}
        shot="fabric"
        fabric={fabric.id}
        subject={`${fabric.name} · ${fabric.motif[lang]}`}
        className={`w-full ${wide ? "aspect-[16/9]" : tall ? "aspect-[4/5]" : "aspect-[4/3]"}`}
        sizes={wide ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 40vw, 100vw"}
      />
      <p className="label mt-4 !text-[10px]">
        {fabric.name} · {fabric.motif[lang]}
      </p>
    </>
  );
}

export async function StoryView({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  const { collections, fabrics, getFabric, site } = await getCatalog();
  // Katı arama: getFabric bilinmeyen kimlikte ilk kumaşa döner; burada yanlış kumaş yerine görselsiz durak isteriz.
  const fabricOf = (id?: string) => (id ? fabrics.find((f) => f.id === id) : undefined);
  const stops = roadStops(lang, collections, getFabric, site.hero.orbs, c.road);
  const cross = fabricOf(c.crossroads.fabric);

  return (
    <StoryRoad className="pb-[14vh]">
      {/* Açılış: CSS ile girer, JavaScript beklemez. Çizgi buradan başlar. */}
      <Row className="pb-[12vh] pt-[22vh] lg:pt-[26vh]">
        <p className="label rise">{c.label}</p>
        <h1 className="display rise mt-6 max-w-[14ch]" style={{ ["--d" as string]: "120ms" }}>
          {c.title}
        </h1>
        <p className="rise mt-8 font-serif text-xl font-light italic text-fildisi/80 md:text-2xl" style={{ ["--d" as string]: "260ms" }}>
          {c.sub}
        </p>
      </Row>

      {/* Desenlerin yolu */}
      {c.stops.map((s, i) => {
        const f = fabricOf(s.fabric);
        return (
          <Row key={s.city} mark="sm" className="py-[9vh]">
            <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
              <Reveal className="lg:col-span-5">
                <p className="label !text-altin">{s.city}</p>
                <h2 className="display-sm mt-3">{s.motif}</h2>
                <p className="prose-quiet mt-5 max-w-[40ch] text-fildisi/90">{s.text}</p>
              </Reveal>
              {f && (
                <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.12}>
                  <FabricShot lang={lang} fabric={f} tall={i % 2 === 0} />
                </Reveal>
              )}
            </div>
          </Row>
        );
      })}

      {/* Kavşak */}
      <Row mark="lg" className="py-[12vh]">
        <Reveal>
          <p className="label !text-altin">{c.crossroads.label}</p>
          <h2 className="display-md mt-3 max-w-[16ch]">{c.crossroads.title}</h2>
          <p className="prose-quiet mt-6 max-w-[52ch] text-fildisi/90">{c.crossroads.text}</p>
        </Reveal>
        {cross && (
          <Reveal className="mt-12 lg:max-w-[78%]" delay={0.1}>
            <FabricShot lang={lang} fabric={cross} wide />
          </Reveal>
        )}
      </Row>

      {/* Bugün */}
      <Row mark="sm" className="py-[10vh]">
        <Reveal>
          <p className="label">{c.today.label}</p>
          <h2 className="display-sm mt-3">{c.today.title}</h2>
          <p className="prose-quiet mt-6 max-w-[52ch] text-fildisi/90">{c.today.text}</p>
        </Reveal>
      </Row>

      {/* Markanın durakları: yayında koleksiyon yoksa bölüm hiç çıkmaz */}
      {stops.length > 0 && (
        <>
          <Row className="pb-4 pt-[8vh]">
            <Reveal>
              <p className="font-serif text-xl font-light italic text-fildisi/80 md:text-2xl">{c.road.intro}</p>
            </Reveal>
          </Row>
          {stops.map((s) => (
            <Row key={s.id} mark="sm" className="py-[5vh]">
              <Reveal className="flex items-start gap-6">
                {s.tile && (
                  <Image
                    src={s.tile}
                    alt=""
                    width={112}
                    height={112}
                    unoptimized
                    className="h-20 w-20 shrink-0 object-cover lg:h-28 lg:w-28"
                  />
                )}
                <div>
                  <p className="label">{s.kicker}</p>
                  <h3 className="display-sm mt-2">{s.name}</h3>
                  {s.line && <p className="prose-quiet mt-3 max-w-[44ch] text-fildisi/85">{s.line}</p>}
                  <Link href={s.href} className="label mt-4 inline-block !text-altin hover:underline">
                    {c.road.see}
                  </Link>
                </div>
              </Reveal>
            </Row>
          ))}
        </>
      )}

      {/* Davet: yolun son durağı; çizgi burada biter */}
      <Row mark="lg" className="pt-[12vh]">
        <Reveal>
          <h2 className="display-md max-w-[18ch]">{c.invite.title}</h2>
          <p className="prose-quiet mt-6 text-fildisi/85">{c.invite.sub}</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href={href(lang, "consultation")} className="btn">
              {c.invite.cta}
            </Link>
            <Link href={href(lang, "bespoke")} className="btn-quiet">
              {c.invite.how}
            </Link>
          </div>
        </Reveal>
      </Row>
    </StoryRoad>
  );
}
