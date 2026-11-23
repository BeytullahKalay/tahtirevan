"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LANGS, LOCALES, UI, href, translatePath, type Lang } from "@/lib/i18n";
import { Mark } from "./Brand";
import { useCatalog } from "./CatalogProvider";

export function Header({ lang }: { lang: Lang }) {
  const t = UI[lang];
  const pathname = usePathname() || "/";
  const { slugs, pieces } = useCatalog();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  // Koleksiyonlar, yayında parça olana kadar menüde görünmez (boş sayfaya götürmesin); alt bilgide kalır.
  const keys = (["studies", "patterns", "collections", "bespoke", "story"] as const).filter((k) => k !== "collections" || pieces.length > 0);
  const links = keys.map((k) => ({ href: href(lang, k), label: t.nav[k], hint: t.navHint[k] }));

  // Aşağı kaydırınca gizlen, yukarı kaydırınca dön.
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const dy = y - lastY.current;
        if (Math.abs(dy) > 6) {
          setHidden(dy > 0 && y > 140);
          lastY.current = y;
        }
        setScrolled(y > 40);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuBtn.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (h: string) => pathname === h || pathname.startsWith(h + "/");

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color] duration-[900ms] ease-[var(--ease)] ${
          hidden && !open ? "-translate-y-full" : "translate-y-0"
        } ${scrolled && !open ? "bg-gece/85 backdrop-blur-md" : "bg-transparent"}`}
      >
        <div className="flex h-[72px] items-center justify-between px-[var(--gutter)] lg:h-[88px]">
          <Link
            href={href(lang, "home")}
            className="tap relative z-10 flex items-center gap-3 lg:gap-3.5"
            aria-label="Tahtırevan"
          >
            <Mark className="h-8 w-8 shrink-0 text-altin lg:h-9 lg:w-9" />
            <span className="wordmark">Tahtırevan</span>
          </Link>

          <nav aria-label={lang === "tr" ? "Ana menü" : "Main menu"} className="hidden items-center gap-8 lg:flex xl:gap-10">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="link-gold label !text-fildisi/85 hover:!text-fildisi"
                aria-current={isActive(l.href) ? "page" : undefined}
              >
                {l.label}
              </Link>
            ))}
            <span className="flex items-center gap-3" aria-label={UI[lang].footer.language}>
              {LANGS.map((l) => (
                <Link
                  key={l}
                  href={translatePath(pathname, l, slugs)}
                  hrefLang={LOCALES[l].htmlLang}
                  lang={LOCALES[l].htmlLang}
                  className={`label link-gold ${l === lang ? "!text-fildisi" : ""}`}
                  aria-current={l === lang ? "true" : undefined}
                  aria-label={UI[l].langName}
                >
                  {LOCALES[l].label}
                </Link>
              ))}
            </span>
          </nav>

          <div className="flex items-center gap-4">
            <Link href={href(lang, "consultation")} className="btn hidden !min-h-[42px] !px-5 !py-3 lg:inline-flex">
              {t.consult}
            </Link>
            <button
              ref={menuBtn}
              type="button"
              className="label tap relative z-10 !text-fildisi lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? t.close : t.menu}
            </button>
          </div>
        </div>
      </header>

      {/* Mobil: tam ekran, büyük serif menü */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 flex flex-col bg-gece px-[var(--gutter)] pb-10 pt-28 transition-opacity duration-[700ms] ease-[var(--ease)] lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <nav aria-label={lang === "tr" ? "Mobil menü" : "Mobile menu"} className="flex flex-1 flex-col gap-[clamp(12px,2.2svh,22px)] overflow-y-auto overflow-x-hidden">
          {links.map((l, i) => (
            <Link
              key={l.href}
              ref={i === 0 ? firstLink : undefined}
              href={l.href}
              className="group flex flex-col gap-1.5 border-b hairline pb-[clamp(10px,2svh,18px)]"
              aria-current={isActive(l.href) ? "page" : undefined}
            >
              <span className={`font-serif text-[clamp(2rem,5.2svh,2.6rem)] font-light leading-[1.05] ${isActive(l.href) ? "text-altin" : ""}`}>
                {l.label}
              </span>
              <span className="label !text-[10px]">{l.hint}</span>
            </Link>
          ))}
          <Link href={href(lang, "consultation")} className="btn mt-4 self-start">
            {t.consult}
          </Link>
        </nav>
        <div className="flex items-center justify-between border-t hairline pt-6">
          <span className="label">{t.footer.language}</span>
          <span className="flex gap-6">
            {LANGS.map((l) => (
              <Link
                key={l}
                href={translatePath(pathname, l, slugs)}
                hrefLang={LOCALES[l].htmlLang}
                className={`label tap ${l === lang ? "!text-fildisi" : ""}`}
              >
                {UI[l].langName}
              </Link>
            ))}
          </span>
        </div>
      </div>
    </>
  );
}
