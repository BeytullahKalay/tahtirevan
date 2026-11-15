import { Suspense } from "react";
import type { Lang } from "@/lib/i18n";
import { ConsultationForm } from "../ConsultationForm";
import { Reveal } from "../Reveal";

const COPY = {
  tr: {
    label: "Özel görüşme",
    title: "Her taht, sahibini bekler.",
    line: "Birkaç satır yeterli. Size en uygun biçimde, evinizde ya da video ile görüşmek için 24 saat içinde döneceğiz.",
    asideTitle: "Görüşmede neler olur",
    aside: [
      "Mekânı, ışığı ve parçanın duracağı yeri konuşuruz.",
      "Desen kütüphanesinden size uygun kumaşları birlikte seçeriz.",
      "Ölçü, ahşap ve kaplama için ilk çizimi hazırlarız.",
      "Numune kutusu ve teslim takvimi bu görüşmeden sonra netleşir.",
    ],
  },
  en: {
    label: "Private consultation",
    title: "Every throne awaits its owner.",
    line: "A few lines are enough. We will reply within 24 hours to arrange a conversation at your home or by video, whichever suits you.",
    asideTitle: "What the conversation covers",
    aside: [
      "We talk about the room, the light and where the piece will stand.",
      "We choose fabrics from the pattern library together.",
      "We prepare a first drawing for size, wood and finish.",
      "The sample box and the delivery schedule follow from there.",
    ],
  },
};

export function ConsultationView({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  return (
    <section className="grid gap-16 px-[var(--gutter)] pb-[14vh] pt-36 lg:grid-cols-12 lg:pt-48">
      <div className="lg:col-span-4">
        <Reveal>
          <p className="label">{c.label}</p>
          <h1 className="display-md mt-4">{c.title}</h1>
          <p className="mt-6 max-w-[40ch] text-tas">{c.line}</p>
        </Reveal>
        <Reveal delay={0.15} className="mt-14 hidden border-t hairline pt-8 lg:block">
          <h2 className="label">{c.asideTitle}</h2>
          <ol className="mt-6 flex flex-col gap-5">
            {c.aside.map((a, i) => (
              <li key={a} className="flex gap-4">
                <span className="font-serif text-2xl leading-none text-altin">{i + 1}</span>
                <span className="text-fildisi/85">{a}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
      <Reveal className="lg:col-span-7 lg:col-start-6" delay={0.1}>
        <Suspense fallback={<div className="min-h-[60vh]" />}>
          <ConsultationForm lang={lang} />
        </Suspense>
      </Reveal>
    </section>
  );
}
