import type { ReactNode } from "react";
import { serif, sans } from "@/lib/fonts";
import { LOCALES, UI, type Lang } from "@/lib/i18n";
import { organizationLd } from "@/lib/seo";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Cursor } from "./Cursor";
import { Intro, introScript } from "./Intro";
import { Consent } from "./Consent";
import { JsonLd } from "./JsonLd";
import "@/app/globals.css";

/** Her dilin kök düzeni bunu kullanır; html lang ve dir dilden gelir. */
export function SiteShell({ lang, children }: { lang: Lang; children: ReactNode }) {
  const t = UI[lang];
  return (
    <html
      lang={LOCALES[lang].htmlLang}
      dir={LOCALES[lang].dir}
      className={`${serif.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        <JsonLd data={organizationLd(lang)} />
      </head>
      <body>
        <a
          href="#main"
          className="label fixed left-4 top-4 z-[60] -translate-y-24 bg-gece px-4 py-3 !text-fildisi transition-transform focus:translate-y-0"
        >
          {t.skip}
        </a>
        <Intro />
        <Header lang={lang} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer lang={lang} />
        <Cursor label={t.explore} />
        <Consent lang={lang} />
      </body>
    </html>
  );
}
