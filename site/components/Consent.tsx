"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UI, href, type Lang } from "@/lib/i18n";

const KEY = "tr-consent";
const DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, string> }) => void;
  }
}

function loadAnalytics() {
  if (!DOMAIN || document.getElementById("plausible")) return;
  const s = document.createElement("script");
  s.id = "plausible";
  s.defer = true;
  s.dataset.domain = DOMAIN;
  s.src = "https://plausible.io/js/script.tagged-events.js";
  document.head.appendChild(s);
}

/** Dönüşüm takibi: yalnızca onay verilmiş ve araç yüklenmişse çalışır. */
export function track(event: string, props?: Record<string, string>) {
  try {
    window.plausible?.(event, props ? { props } : undefined);
  } catch {}
}

/**
 * Sessiz, sayfanın altına yaslanan onay çubuğu. Açılır pencere değildir.
 * Analitik yapılandırılmamışsa hiç görünmez.
 */
export function Consent({ lang }: { lang: Lang }) {
  const t = UI[lang].consent;
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!DOMAIN) return;
    let v: string | null = null;
    try {
      v = localStorage.getItem(KEY);
    } catch {}
    if (v === "yes") loadAnalytics();
    else if (v !== "no") setShow(true);
  }, []);

  const decide = (yes: boolean) => {
    try {
      localStorage.setItem(KEY, yes ? "yes" : "no");
    } catch {}
    if (yes) loadAnalytics();
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="region"
      aria-label={lang === "tr" ? "Çerez tercihi" : "Cookie preference"}
      className="fixed inset-x-0 bottom-0 z-40 border-t hairline bg-gece/95 px-[var(--gutter)] py-5 backdrop-blur"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="max-w-[70ch] text-[15px] text-fildisi/85">
          {t.text}{" "}
          <Link href={href(lang, "cookies")} className="link-gold is-static text-fildisi">
            {t.more}
          </Link>
        </p>
        <div className="flex gap-6">
          <button type="button" className="label tap link-gold !text-tas" onClick={() => decide(false)}>
            {t.decline}
          </button>
          <button type="button" className="btn !min-h-[42px] !py-3" onClick={() => decide(true)}>
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
