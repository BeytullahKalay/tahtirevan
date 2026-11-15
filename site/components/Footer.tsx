"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LANGS, LOCALES, UI, href, translatePath, type Lang } from "@/lib/i18n";
import { Monogram } from "./Monogram";
import { Newsletter } from "./Newsletter";

export function Footer({ lang }: { lang: Lang }) {
  const t = UI[lang];
  const pathname = usePathname() || "/";
  const year = new Date().getFullYear();

  return (
    <footer className="border-t hairline px-[var(--gutter)] pb-10 pt-20 lg:pt-28">
      <div className="grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <h2 className="display-sm">{t.footer.letters}</h2>
          <p className="mt-4 max-w-[44ch] text-tas">{t.footer.lettersLine}</p>
          <div className="mt-8">
            <Newsletter lang={lang} />
          </div>
        </div>

        <nav aria-label={lang === "tr" ? "Alt bilgi" : "Footer"} className="grid grid-cols-2 gap-10 lg:col-span-6 lg:grid-cols-3">
          <div className="flex flex-col gap-3">
            <span className="label mb-2">Tahtırevan</span>
            <Link className="link-gold self-start" href={href(lang, "collections")}>{t.nav.collections}</Link>
            <Link className="link-gold self-start" href={href(lang, "patterns")}>{t.nav.patterns}</Link>
            <Link className="link-gold self-start" href={href(lang, "bespoke")}>{t.nav.bespoke}</Link>
            <Link className="link-gold self-start" href={href(lang, "story")}>{t.nav.story}</Link>
            <Link className="link-gold self-start" href={href(lang, "consultation")}>{t.consult}</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="label mb-2">{lang === "tr" ? "Bilgi" : "Information"}</span>
            <Link className="link-gold self-start" href={href(lang, "care")}>{t.footer.care}</Link>
            <Link className="link-gold self-start" href={href(lang, "press")}>{t.footer.press}</Link>
            <Link className="link-gold self-start" href={href(lang, "privacy")}>{t.footer.privacy}</Link>
            <Link className="link-gold self-start" href={href(lang, "cookies")}>{t.footer.cookies}</Link>
          </div>
          <div className="col-span-2 flex flex-col gap-3 lg:col-span-1">
            <span className="label mb-2">{t.footer.follow}</span>
            <a className="link-gold self-start" href="https://www.instagram.com/" rel="noopener" target="_blank">
              Instagram
            </a>
            <a className="link-gold self-start" href="https://www.pinterest.com/" rel="noopener" target="_blank">
              Pinterest
            </a>
            <span className="label mb-2 mt-6">{t.footer.language}</span>
            <div className="flex gap-5">
              {LANGS.map((l) => (
                <Link
                  key={l}
                  href={translatePath(pathname, l)}
                  hrefLang={LOCALES[l].htmlLang}
                  className={`link-gold tap ${l === lang ? "text-fildisi" : "text-tas"}`}
                  aria-current={l === lang ? "true" : undefined}
                >
                  {UI[l].langName}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>

      <div className="mt-24 flex flex-col items-start justify-between gap-6 border-t hairline pt-8 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4 text-altin">
          <Monogram size={36} />
          <span className="wordmark text-fildisi">Tahtırevan</span>
        </div>
        <p className="label">
          © {year} Tahtırevan · {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
