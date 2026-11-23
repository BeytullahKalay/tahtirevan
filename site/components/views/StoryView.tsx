import Link from "next/link";
import { href, type Lang } from "@/lib/i18n";
import { Media } from "../Media";
import { Reveal } from "../Reveal";

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
    founderLabel: "Kurucunun notu",
    // TASLAK: kurucunun kendi sözleriyle değiştirilecek.
    founder:
      "Tahtırevan'ı tek bir soruyla kurduk: bir koltuk, sahibini bir ömür boyu taşıyabilir mi? Cevabı desende değil, gövdenin içinde aradık. Göz alan bir desen, onu taşıyacak kadar sağlam bir gövde ve ikisini bir araya getiren sabırlı bir el.",
    founderName: "Kurucu adı",
    founderRole: "Kurucu, Tahtırevan",
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
    founderLabel: "A note from the founder",
    // DRAFT: to be replaced with the founder's own words.
    founder:
      "We started Tahtırevan with one question: can a chair carry its owner for a lifetime? We looked for the answer inside the frame, not on its surface. A pattern that holds the eye, a frame strong enough to carry it, and a patient hand to bring the two together.",
    founderName: "Founder's name",
    founderRole: "Founder, Tahtırevan",
    cta: "Request a consultation to see our fabrics",
  },
};

export function StoryView({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  const shots = [
    { subject: lang === "tr" ? "Eski bir tahtırevan, müze ışığında" : "An old tahtırevan in museum light", shot: "space" as const },
    { subject: lang === "tr" ? "Ölçü alan eller" : "Hands taking measurements", shot: "craft" as const },
    { subject: lang === "tr" ? "Kumaş topları ve desen provası" : "Bolts of cloth and a pattern proof", shot: "craft" as const },
  ];
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
              shot={shots[i].shot}
              subject={shots[i].subject}
              colors={["#5a3a24"]}
              className={i === 0 ? "aspect-[4/5] w-full" : "aspect-[4/3] w-full"}
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
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
