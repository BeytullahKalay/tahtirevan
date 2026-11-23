import Link from "next/link";
import { getCatalog } from "@/lib/catalog.server";
import { href, type Lang } from "@/lib/i18n";
import { roadStops } from "@/lib/road";
import { Media } from "../Media";
import { Reveal } from "../Reveal";
import { RoadStops } from "../RoadStops";

const COPY = {
  tr: {
    label: "Hikâye",
    title: "Yürüyen taht.",
    chapters: [
      {
        h: "Bir taht, yolda",
        p: [
          "Tahtırevan, iki hayvanın ya da omuzların taşıdığı, üstü kapalı ve perdeli bir oturaktı. Osmanlı'da ve İpek Yolu boyunca hükümdarlar, saray kadınları ve uzun yolculuğa çıkan büyükler onunla yol alırdı.",
          "Adı da bunu söyler: taht ve revan, yani giden, yürüyen. Saray yerinde durur; tahtırevan sahibiyle birlikte yola çıkar.",
        ],
      },
      {
        h: "Sahibi için yapılan",
        p: [
          "Her tahtırevan, onu kullanacak kişiye göre yapılırdı. Ölçüsü, ahşabı, kumaşı ve süslemesi bir başkasına göre değil, yalnızca ona göreydi.",
          "Bizim çıkış noktamız bu tek fikir. Seri üretim yok, stok yok. Her parça bir kişi için başlar ve onun evinde tamamlanır.",
        ],
      },
      {
        h: "Bugün",
        p: [
          "Bugün her parça, birlikte çalıştığımız döşeme atölyelerinde ustaların elinde kurulur. Kumaşlarımız ailemizin kumaş geleneğinden gelir.",
          "Bir Tahtırevan, nesilden nesile geçmek için yapılır. Numarası ve pirinç damgası onunla birlikte yolculuk eder.",
        ],
      },
    ],
    road: {
      label: "Yol",
      title: "Yol ve duraklar.",
      p: [
        "Anadolu bir kumaş kavşağıydı: İpek Yolu'ndan, limanlardan ve saraylardan gelen desenler burada buluştu. Tahtırevan da bir yolculuk aracıydı.",
        "Koleksiyonlarımız bu yolun duraklarıdır. Her biri, Anadolu'ya kumaş ve ticaretle bağlanan bir kültürden doğar. Yol, kuruluş serisiyle başlıyor.",
      ],
      stop: "Durak",
      start: "Başlangıç",
      next: "Sıradaki durak",
      nextLine: "Yolun devamı",
      see: "Koleksiyonu gör",
    },
    founderLabel: "Kurucunun notu",
    // TASLAK: kurucunun kendi sözleriyle değiştirilecek.
    founder:
      "Tahtırevan'ı tek bir soruyla kurduk: bir koltuk, sahibini bir ömür boyu taşıyabilir mi? Cevabı desende değil, gövdenin içinde aradık. Göz alan bir desen, onu taşıyacak kadar sağlam bir gövde ve ikisini bir araya getiren sabırlı bir el.",
    founderName: "Beytullah Kalay",
    founderRole: "Kurucu · Tasarım Direktörü",
    cta: "Kumaşlarımızı görmek için görüşme talep edin",
  },
  en: {
    label: "Story",
    title: "The walking throne.",
    chapters: [
      {
        h: "A throne on the road",
        p: [
          "A tahtırevan was a covered, curtained seat carried between two animals or on shoulders. Across the Ottoman lands and along the Silk Road, rulers, palace women and great travellers made their journeys in one.",
          "The name says it plainly: taht, the throne, and revan, the one that moves. A palace stays where it is. A tahtırevan sets out with its owner.",
        ],
      },
      {
        h: "Made for its owner",
        p: [
          "Each tahtırevan was built for the person who would ride in it. Its size, its wood, its cloth and its ornament answered to them alone.",
          "That single idea is where we begin. No series, no stock. Every piece starts with one person and is finished in their home.",
        ],
      },
      {
        h: "Today",
        p: [
          "Today every piece is built by master upholsterers in the workshops we work with. Our fabrics come from our family's long trade in cloth.",
          "A Tahtırevan is made to pass from one generation to the next. Its number and its brass seal travel with it.",
        ],
      },
    ],
    road: {
      label: "The road",
      title: "The road and its stops.",
      p: [
        "Anatolia was a crossroads of cloth: patterns from the Silk Road, the ports and the palaces met here. The tahtırevan, too, was made for the journey.",
        "Our collections are the stops along that road. Each is born of a culture tied to Anatolia by cloth and trade. The road begins with the founding series.",
      ],
      stop: "Stop",
      start: "The beginning",
      next: "The next stop",
      nextLine: "The road goes on",
      see: "See the collection",
    },
    founderLabel: "A note from the founder",
    // DRAFT: to be replaced with the founder's own words.
    founder:
      "We started Tahtırevan with one question: can a chair carry its owner for a lifetime? We looked for the answer inside the frame, not on its surface. A pattern that holds the eye, a frame strong enough to carry it, and a patient hand to bring the two together.",
    founderName: "Beytullah Kalay",
    founderRole: "Founder · Creative Director",
    cta: "Request a consultation to see our fabrics",
  },
};

export async function StoryView({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  // Duraklar panelden gelir: yayındaki her koleksiyon yolun bir durağıdır; ardından boş "sıradaki durak"lar.
  const { collections, getFabric, site } = await getCatalog();
  const upcoming = Math.max(1, 4 - collections.length);
  // Bölüm görselleri kumaştan gelir (koltuk fotoğrafı ve ondan kırpımlar kullanıcı isteğiyle kaldırıldı).
  // Kumaş yayından kalkarsa getFabric ilk kumaşa döner; sayfa boş kalmaz.
  const shots = ["soraya", "ardente", "sapphire"].map((id) => getFabric(id));
  return (
    <>
      <section className="px-[var(--gutter)] pb-[10vh] pt-36 text-center lg:pt-48">
        <Reveal className="flex flex-col items-center">
          <p className="label">{c.label}</p>
          <h1 className="display mt-4">{c.title}</h1>
        </Reveal>
      </section>

      {c.chapters.map((ch, i) => (
        <section key={ch.h} className="grid items-center gap-10 px-[var(--gutter)] py-[10vh] lg:grid-cols-12">
          <Reveal className={`lg:col-span-6 ${i % 2 ? "lg:order-2 lg:col-start-7" : ""}`}>
            <Media
              lang={lang}
              shot="fabric"
              fabric={shots[i].id}
              subject={`${shots[i].name} · ${shots[i].motif[lang]}`}
              className={i === 0 ? "aspect-[4/5] w-full" : "aspect-[4/3] w-full"}
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            <p className="label mt-4 !text-[10px]">
              {shots[i].name} · {shots[i].motif[lang]}
            </p>
          </Reveal>
          <Reveal className={`lg:col-span-5 ${i % 2 ? "lg:order-1" : "lg:col-start-8"}`} delay={0.12}>
            <p className="label">{String(i + 1).padStart(2, "0")}</p>
            <h2 className="display-sm mt-3">{ch.h}</h2>
            <div className="prose-quiet mt-6 max-w-[46ch] text-fildisi/90">
              {ch.p.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </Reveal>
        </section>
      ))}

      {/* Yol ve duraklar: markanın ana hikâyesi */}
      <section aria-labelledby="road-title" className="border-t hairline px-[var(--gutter)] py-[16vh]">
        <Reveal className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="label">
              {String(c.chapters.length + 1).padStart(2, "0")} · {c.road.label}
            </p>
            <h2 id="road-title" className="display-md mt-3">
              {c.road.title}
            </h2>
          </div>
          <div className="prose-quiet max-w-[50ch] text-fildisi/90 lg:col-span-6 lg:col-start-7">
            {c.road.p.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Reveal>

        <RoadStops
          stops={roadStops(lang, collections, getFabric, site.hero.orbs, c.road)}
          upcoming={upcoming}
          stopWord={c.road.stop}
          next={c.road.next}
          nextLine={c.road.nextLine}
          see={c.road.see}
        />
      </section>

      <section className="bg-ceviz/40 px-[var(--gutter)] py-[18vh]">
        <Reveal className="mx-auto max-w-[900px] text-center">
          <p className="label">{c.founderLabel}</p>
          <blockquote className="mt-8 font-serif text-[1.6rem] font-light italic leading-[1.4] md:text-[2.3rem]">
            “{c.founder}”
          </blockquote>
          <div className="mt-12 flex flex-col items-center gap-2">
            {/* İmza: gerçek imza taraması geldiğinde SVG olarak değiştirilecek */}
            <span className="font-serif text-4xl italic text-altin" aria-hidden="true">
              {c.founderName}
            </span>
            <span className="label">{c.founderRole}</span>
          </div>
        </Reveal>
      </section>

      <section className="px-[var(--gutter)] py-[16vh] text-center">
        <Link href={href(lang, "consultation")} className="btn">
          {c.cta}
        </Link>
      </section>
    </>
  );
}
