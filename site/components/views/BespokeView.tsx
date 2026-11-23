import Link from "next/link";
import { ROUTES, href, type Lang } from "@/lib/i18n";
import { Reveal } from "../Reveal";

const COPY = {
  tr: {
    label: "Size özel",
    title: "Bir taht, tek bir kişi için.",
    line: "Her Tahtırevan bir görüşmeyle başlar ve sahibinin evinde biter. Arada altı adım vardır.",
    steps: [
      ["Özel görüşme", "Evinizde ya da video ile. Mekânı, ışığı ve parçanın nerede duracağını konuşuruz."],
      ["Gövde tasarımı ve desen seçimi", "Gövdeyi birlikte çizer, desenin gövde üzerindeki yerini işaretleriz. Çizim sizin onayınızla kesinleşir."],
      ["Malzeme ve kumaş", "Seçtiğiniz kumaşlar; nakış, püskül ve pirinç örnekleriyle birlikte bir numune kutusu olarak kapınıza gelir."],
      ["Atölyede yapım", "Parça, birlikte çalıştığımız atölyede ustaların elinde kurulur. İki haftada bir size ilerleme fotoğrafı ve videosu göndeririz."],
      ["Teslimat ve kurulum", "Parça size getirilir, yerine konur ve kurulur."],
      ["Sertifika ve bakım", "Numaralı sertifikanız parçayla birlikte gelir. Bakım ve yeniden döşeme için bize her zaman ulaşabilirsiniz."],
    ],
    projectsLabel: "Projeler",
    projectsTitle: "Projeler için Tahtırevan",
    projectsLine: "İç mimarlar, butik oteller, özel kulüpler ve temsil mekânları için tek parçadan tam bir salona kadar çalışırız.",
    projectsPoints: [
      "Projeye özel ölçü, gövde ve desen yerleşimi",
      "Teknik çizimler ve malzeme föyleri",
      "Proje takvimine göre planlanan üretim ve kurulum",
    ],
    projectsCta: "Proje görüşmesi talep edin",
    cta: "Özel görüşme talep edin",
  },
  en: {
    label: "Bespoke",
    title: "A throne, for one person.",
    line: "Every Tahtırevan begins with a conversation and ends in its owner's home. Between the two are six steps.",
    steps: [
      ["A private consultation", "At your home, or by video. We talk about the room, the light and where the piece will stand."],
      ["Frame design and pattern", "We draw the body together and mark where the pattern will fall on it. The drawing is final only once you approve it."],
      ["Materials and fabric", "Your chosen fabrics arrive at your door in a sample box, with samples of the embroidery, the tassel and the brass."],
      ["Made in the atelier", "The piece is built by master upholsterers in a workshop we work with. Every two weeks we send you photographs and a short film of its progress."],
      ["Delivery and installation", "The piece is brought to you, placed and set up."],
      ["Certificate and care", "Your numbered certificate arrives with the piece. For care and reupholstery, you can always reach us."],
    ],
    projectsLabel: "Projects",
    projectsTitle: "Tahtırevan for projects",
    projectsLine: "For interior designers, boutique hotels, private clubs and representative spaces, from a single piece to a full salon.",
    projectsPoints: [
      "Dimensions, frame and pattern placement made for the project",
      "Technical drawings and material sheets",
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

      {/* Altı adım: görselsiz, yazı ağırlıklı (koltuk fotoğrafı ve kırpımları kullanıcı isteğiyle kaldırıldı) */}
      <ol className="grid border-t hairline px-[var(--gutter)] md:grid-cols-2 lg:grid-cols-3">
        {c.steps.map(([title, body], i) => (
          <li
            key={title}
            className={`border-b hairline py-[7vh] md:py-[9vh] md:pr-10 ${i % 2 === 1 ? "md:border-l md:pl-10" : ""} ${
              i % 3 !== 0 ? "lg:border-l lg:pl-10" : "lg:border-l-0 lg:pl-0"
            }`}
          >
            <Reveal delay={(i % 3) * 0.1}>
              <span className="font-serif text-[4.5rem] font-light leading-none text-altin md:text-[5.5rem]" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="display-sm mt-6">
                <span className="sr-only">{i + 1}. </span>
                {title}
              </h2>
              <p className="mt-4 max-w-[40ch] text-tas">{body}</p>
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
