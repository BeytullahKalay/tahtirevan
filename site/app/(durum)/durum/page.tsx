import config from "@payload-config";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import { Emblem, Mark } from "@/components/Brand";
import { getCatalogData } from "@/lib/catalog.server";
import { LangSwitch, NotifyForm } from "./GateClient";

/**
 * Site kapalıyken ziyaretçinin gördüğü sayfa ("Yakında" ya da "Bakımdayız").
 * Ziyaretçiyi buraya site/proxy.ts getirir; adres çubuğunda ziyaret ettiği adres kalır.
 * Ayarlar: panel → Ayarlar → Site durumu. Önizleme: /durum?onizle=yakinda | bakim
 */
export const dynamic = "force-dynamic";

type Lang = "tr" | "en";
type Mode = "soon" | "maintenance";
type Loc = { tr?: string | null; en?: string | null } | null | undefined;
type Status = {
  mode?: "live" | Mode;
  soon?: { title?: Loc; message?: Loc; launchDate?: string | null; showForm?: boolean | null };
  maintenance?: { title?: Loc; message?: Loc; returnAt?: string | null };
  contactEmail?: string | null;
};
type SP = Promise<{ lang?: string; onizle?: string }>;

const DEFAULTS = {
  soon: {
    label: { tr: "Yakında", en: "Coming soon" },
    title: { tr: "Bir taht, tek bir kişi için.", en: "A throne, made for one." },
    message: {
      tr: "Her parça sahibi için, siparişle yapılır. Kapılarımızı çok yakında açıyoruz.",
      en: "Every piece is made to order, for its owner. Our doors open soon.",
    },
  },
  maintenance: {
    label: { tr: "Bakımdayız", en: "Under maintenance" },
    title: { tr: "Atölyede kısa bir düzenleme yapıyoruz.", en: "A short pause in the atelier." },
    message: {
      tr: "Site kısa süre sonra yeniden açılacak. Anlayışınız için teşekkür ederiz.",
      en: "The site will be back shortly. Thank you for your patience.",
    },
  },
} as const;

const pick = (v: Loc, fallback: { tr: string; en: string }) => ({
  tr: v?.tr?.trim() || fallback.tr,
  en: v?.en?.trim() || v?.tr?.trim() || fallback.en,
});

const formatDate = (iso: string, lang: Lang, withTime: boolean) =>
  new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Europe/Istanbul",
  }).format(new Date(iso));

async function getStatus(): Promise<Status> {
  const payload = await getPayload({ config });
  return (await payload.findGlobal({ slug: "site-status", locale: "all", depth: 0 })) as unknown as Status;
}

function resolveMode(status: Status, onizle?: string): { mode: Mode | null; preview: boolean } {
  if (onizle === "yakinda") return { mode: "soon", preview: true };
  if (onizle === "bakim") return { mode: "maintenance", preview: true };
  const m = status.mode;
  return { mode: m === "soon" || m === "maintenance" ? m : null, preview: false };
}

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { lang, onizle } = await searchParams;
  const { mode } = resolveMode(await getStatus(), onizle);
  const l: Lang = lang === "en" ? "en" : "tr";
  return { title: `Tahtırevan · ${DEFAULTS[mode ?? "soon"].label[l]}` };
}

export default async function DurumPage({ searchParams }: { searchParams: SP }) {
  const { lang: qLang, onizle } = await searchParams;
  const lang: Lang = qLang === "en" ? "en" : "tr";
  const status = await getStatus();
  const { mode, preview } = resolveMode(status, onizle);
  // Site açıksa bu sayfanın gösterilecek bir şeyi yok.
  if (!mode) redirect(lang === "en" ? "/en" : "/");

  const d = DEFAULTS[mode];
  const s = mode === "soon" ? status.soon : status.maintenance;
  const title = pick(s?.title, d.title);
  const message = pick(s?.message, d.message);
  const date = mode === "soon" ? status.soon?.launchDate : status.maintenance?.returnAt;
  const showForm = mode === "soon" && status.soon?.showForm !== false;
  const email = status.contactEmail?.trim();

  const { fabrics, codes } = await getCatalogData();
  const strip = [...fabrics, ...fabrics, ...fabrics, ...fabrics];
  const titles = { tr: `Tahtırevan · ${d.label.tr}`, en: `Tahtırevan · ${d.label.en}` };

  return (
    <>
      {/* Dil, ilk boyamadan önce ayarlanır (kök düzen dil bilmez). */}
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(lang)}` }} />

      <header className="g-head">
        <span className="g-logo" role="img" aria-label="Tahtırevan">
          <Mark />
          <span className="g-wordmark" aria-hidden="true">
            Tahtırevan
          </span>
        </span>
        <LangSwitch initial={lang} titles={titles} />
      </header>

      <main className={`g-main${mode === "maintenance" ? " g-maint" : ""}`}>
        <div className="g-stage" aria-hidden="true">
          <div className="g-glow" />
        </div>

        <div className="g-copy">
          <p className="g-label">
            <span data-l="tr">{d.label.tr}</span>
            <span data-l="en">{d.label.en}</span>
          </p>
          <h1 className="g-title">
            <span data-l="tr">{title.tr}</span>
            <span data-l="en">{title.en}</span>
          </h1>
          <p className="g-lede">
            <span data-l="tr">{message.tr}</span>
            <span data-l="en">{message.en}</span>
          </p>
          {date && (
            <p className="g-when">
              {mode === "soon" ? (
                <>
                  <span data-l="tr">{formatDate(date, "tr", false)} tarihinde açılıyor</span>
                  <span data-l="en">Opening {formatDate(date, "en", false)}</span>
                </>
              ) : (
                <>
                  <span data-l="tr">Tahmini dönüş: {formatDate(date, "tr", true)}</span>
                  <span data-l="en">Expected back: {formatDate(date, "en", true)}</span>
                </>
              )}
            </p>
          )}
          <div className="g-rule" aria-hidden="true" />

          {showForm && <NotifyForm preview={preview} initial={lang} />}

          {email && (
            <p className="g-contact">
              <span data-l="tr">Bize yazın: </span>
              <span data-l="en">Write to us: </span>
              <a href={`mailto:${email}`}>{email}</a>
            </p>
          )}
        </div>
      </main>

      {strip.length > 0 && (
        <>
          <div className="g-strip" aria-hidden="true">
            <div className="g-track">
              {strip.map((f, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={f.swatch} alt="" width={76} height={76} loading="lazy" decoding="async" />
              ))}
            </div>
          </div>
          <p className="g-codes g-label" aria-hidden="true">
            <span data-l="tr">{codes.map((c) => c.name.tr).join(" · ")}</span>
            <span data-l="en">{codes.map((c) => c.name.en).join(" · ")}</span>
          </p>
        </>
      )}

      <footer className="g-foot">
        <span className="g-brand">
          <Emblem className="g-emblem" />
          <span className="g-label">© {new Date().getFullYear()} Tahtırevan</span>
        </span>
        <span className="g-label">
          <span data-l="tr">Her parça siparişle yapılır ve numaralıdır.</span>
          <span data-l="en">Every piece is made to order and numbered.</span>
        </span>
      </footer>
    </>
  );
}
