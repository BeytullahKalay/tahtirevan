import Link from "next/link";
import { ROUTES, href, type Lang } from "@/lib/i18n";
import { Media, type Shot } from "../Media";
import { Reveal } from "../Reveal";

const COPY = {
  tr: {
    label: "Size özel",
    title: "Bir taht, tek bir kişi için.",
    line: "Her Tahtırevan bir görüşmeyle başlar ve sahibinin evinde, ömür boyu sürecek bir bakım sözüyle biter. Arada altı adım vardır.",
    steps: [
      ["Özel görüşme", "Evinizde ya da video ile. Mekânı, ışığı ve parçanın nerede duracağını konuşuruz.", "space", "Görüşme · mekân ölçümü"],
      ["Gövde tasarımı ve desen seçimi", "Ustamız gövdeyi çizer, desenin gövde üzerindeki yerini işaretler. Çizim sizin onayınızla kesinleşir.", "craft", "Kâğıt üzerinde gövde çizimi"],
      ["Malzeme ve kumaş", "Seçtiğiniz kumaşlar, ahşap ve kaplama örnekleriyle birlikte bir numune kutusu olarak kapınıza gelir.", "fabric", "Numune kutusu"],
      ["Atölyede yapım", "Gövde oyulur, çatılır ve kaplanır; döşeme elde kurulur. Her aşamayı fotoğraflarla sizinle paylaşırız.", "macro", "Atölyede gövde yapımı"],
      ["Beyaz eldivenli teslimat", "Parça, ekibimiz tarafından getirilir, yerine konur ve kurulur. Ambalaj bizimle geri döner.", "space", "Teslimat ve kurulum"],
      ["Sertifika ve ömür boyu bakım", "Numaralı sertifikanız parçayla birlikte gelir. Bakım, onarım ve yeniden döşeme ömür boyu bizdedir.", "macro", "Gövde altındaki numara ve imza"],
    ],
    projectsLabel: "Projeler",
    projectsTitle: "Projeler için Tahtırevan",
    projectsLine: "İç mimarlar, butik oteller, özel kulüpler ve temsil mekânları için tek parçadan tam bir salona kadar çalışırız.",
    projectsPoints: [
      "Projeye özel ölçü, gövde ve desen yerleşimi",
      "Teknik çizimler ve malzeme föyleri",
      "Yangın ve kullanım standartlarına uygun döşeme seçenekleri",
      "Proje takvimine göre planlanan üretim ve kurulum",
    ],
    projectsCta: "Proje görüşmesi talep edin",
    cta: "Özel görüşme talep edin",
  },
  en: {
    label: "Bespoke",
    title: "A throne, for one person.",
    line: "Every Tahtırevan begins with a conversation and ends in its owner's home, with a promise of care for life. Between the two are six steps.",
    steps: [
      ["A private consultation", "At your home, or by video. We talk about the room, the light and where the piece will stand.", "space", "Consultation · measuring the room"],
      ["Frame design and pattern", "Our master draws the frame and marks where the pattern will fall on it. The drawing is final only once you approve it.", "craft", "Frame drawing on paper"],
      ["Materials and fabric", "Your chosen fabrics arrive at your door in a sample box, with samples of the wood and finish.", "fabric", "The sample box"],
      ["Made in the atelier", "The frame is carved, joined and finished; the upholstery is built by hand. We share every stage with you in photographs.", "macro", "The frame in the atelier"],
      ["White-glove delivery", "Our own team brings the piece, places it and sets it up. The packaging leaves with us.", "space", "Delivery and installation"],
      ["Certificate and lifetime care", "Your numbered certificate arrives with the piece. Care, repair and reupholstery stay with us for life.", "macro", "Number and signature beneath the frame"],
    ],
    projectsLabel: "Projects",
    projectsTitle: "Tahtırevan for projects",
    projectsLine: "For interior designers, boutique hotels, private clubs and representative spaces, from a single piece to a full salon.",
    projectsPoints: [
      "Dimensions, frame and pattern placement made for the project",
      "Technical drawings and material sheets",
      "Upholstery options to contract and fire standards",
      "Making and installation planned around your schedule",
    ],
    projectsCta: "Request a project consultation",
    cta: "Request a private consultation",
  },
};

export function BespokeView({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  return (
    <>
      <section className="px-[var(--gutter)] pb-[10vh] pt-36 lg:pt-48">
        <Reveal className="max-w-[1000px]">
          <p className="label">{c.label}</p>
          <h1 className="display mt-4 max-w-[14ch]">{c.title}</h1>
          <p className="lede mt-8 max-w-[50ch] !text-tas">{c.line}</p>
        </Reveal>
      </section>

      <ol className="px-[var(--gutter)]">
        {c.steps.map(([title, body, shot, subject], i) => (
          <li key={title} className="grid items-center gap-8 border-t hairline py-[10vh] md:grid-cols-12 md:gap-12">
            <Reveal className={`md:col-span-5 ${i % 2 ? "md:order-2 md:col-start-8" : ""}`}>
              <span className="font-serif text-[5rem] font-light leading-none text-altin md:text-[7rem]" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="display-sm mt-4">
                <span className="sr-only">{i + 1}. </span>
                {title}
              </h2>
              <p className="mt-4 max-w-[42ch] text-tas">{body}</p>
            </Reveal>
            <Reveal className={`md:col-span-6 ${i % 2 ? "md:order-1 md:col-start-1" : "md:col-start-7"}`} delay={0.12}>
              <Media
                lang={lang}
                shot={shot as Shot}
                subject={subject}
                colors={shot === "fabric" ? ["#7a1e2c", "#1f5a44", "#c98a1e"] : ["#4a3424"]}
                className="aspect-[4/3] w-full"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </Reveal>
          </li>
        ))}
      </ol>

      <section className="bg-ceviz/40 px-[var(--gutter)] py-[16vh]" aria-labelledby="projects">
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <p className="label">{c.projectsLabel}</p>
            <h2 id="projects" className="display-md mt-4">{c.projectsTitle}</h2>
            <p className="mt-6 max-w-[46ch] text-tas">{c.projectsLine}</p>
            <Link href={`${ROUTES.consultation[lang]}?proje=ic-mimar`} className="btn mt-10">
              {c.projectsCta}
            </Link>
          </Reveal>
          <Reveal className="lg:col-span-5 lg:col-start-8" delay={0.12}>
            <ul className="flex flex-col">
              {c.projectsPoints.map((p) => (
                <li key={p} className="border-b hairline py-5 font-serif text-2xl leading-snug">
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="px-[var(--gutter)] py-[18vh] text-center">
        <Reveal className="flex flex-col items-center">
          <Link href={href(lang, "consultation")} className="btn">
            {c.cta}
          </Link>
        </Reveal>
      </section>
    </>
  );
}
