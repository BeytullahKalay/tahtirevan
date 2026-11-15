"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Lang = "tr" | "en";

const currentLang = (): Lang => (document.documentElement.lang === "en" ? "en" : "tr");

/** html lang değiştikçe güncellenen dil (dil düğmeleri ayrı bileşende). */
function useHtmlLang(initial: Lang) {
  const [lang, setLang] = useState<Lang>(initial);
  useEffect(() => {
    setLang(currentLang());
    const mo = new MutationObserver(() => setLang(currentLang()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => mo.disconnect();
  }, []);
  return lang;
}

/** TR / EN düğmeleri. Metinlerin iki dili de sayfada; görünür olanı html lang seçer. */
export function LangSwitch({ initial, titles }: { initial: Lang; titles: Record<Lang, string> }) {
  const [lang, setLang] = useState<Lang>(initial);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = titles[lang];
  }, [lang, titles]);

  // Görünmeyen sekmede animasyonları durdur
  useEffect(() => {
    const onVis = () => document.body.classList.toggle("paused", document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <div className="g-langs" role="group" aria-label="Dil / Language">
      {(["tr", "en"] as const).map((l) => (
        <button key={l} type="button" lang={l} aria-pressed={lang === l} onClick={() => setLang(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

const T = {
  tr: {
    ph: "E-posta adresiniz",
    sending: "Gönderiliyor",
    invalid: "Lütfen geçerli bir e-posta adresi yazın.",
    error: "Şu anda kaydedemedik. Lütfen biraz sonra tekrar deneyin.",
    thanks: "Teşekkürler. Kapılar açıldığında ilk mektup size gelecek.",
  },
  en: {
    ph: "Your email address",
    sending: "Sending",
    invalid: "Please enter a valid email address.",
    error: "We could not save that just now. Please try again shortly.",
    thanks: "Thank you. When the doors open, the first letter will be yours.",
  },
};
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** "Haber ver" formu: e-posta panelde Ayarlar → Açılış listesi'ne kaydedilir. */
export function NotifyForm({ preview, initial }: { preview: boolean; initial: Lang }) {
  const lang = useHtmlLang(initial);
  const started = useRef(0);
  const email = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [status, setStatus] = useState<{ key: keyof (typeof T)["tr"]; err?: boolean } | null>(null);

  useEffect(() => {
    started.current = Date.now();
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = email.current?.value.trim() ?? "";
    if (!EMAIL.test(value)) {
      setStatus({ key: "invalid", err: true });
      email.current?.focus();
      return;
    }
    setState("sending");
    setStatus({ key: "sending" });
    const website = (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
    try {
      // Önizlemede (panelden açıldığında) listeye gerçek kayıt eklenmez.
      if (!preview) {
        const r = await fetch("/api/acilis-listesi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: value, lang, website, elapsed: Date.now() - started.current }),
        });
        if (!r.ok) throw new Error(String(r.status));
      }
      setState("done");
      setStatus(null);
    } catch {
      setState("idle");
      setStatus({ key: "error", err: true });
    }
  }

  const both = (key: keyof (typeof T)["tr"]) => (
    <>
      <span data-l="tr">{T.tr[key]}</span>
      <span data-l="en">{T.en[key]}</span>
    </>
  );

  if (state === "done")
    return (
      <div className="g-form">
        <p className="g-thanks" tabIndex={-1} ref={(el) => el?.focus()}>
          {both("thanks")}
        </p>
      </div>
    );

  return (
    <form className="g-form" onSubmit={submit} noValidate>
      <p className="g-form-title" id="notify-title">
        <span data-l="tr">Açılıştan ilk siz haberdar olun.</span>
        <span data-l="en">Be the first to know when we open.</span>
      </p>
      <label htmlFor="email" className="g-sr">
        <span data-l="tr">E-posta adresiniz</span>
        <span data-l="en">Your email address</span>
      </label>
      <div className="g-field">
        <input
          ref={email}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={T[lang].ph}
          aria-describedby="notify-note notify-status"
        />
        <button type="submit" disabled={state === "sending"}>
          <span data-l="tr">Haber ver</span>
          <span data-l="en">Notify me</span>
        </button>
      </div>
      <div className="g-sr" aria-hidden="true">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p className="g-note" id="notify-note">
        <span data-l="tr">E-posta adresinizi yalnızca açılış duyurusu için kullanırız.</span>
        <span data-l="en">We use your email only to announce the opening.</span>
      </p>
      <p className={`g-status${status?.err ? " err" : ""}`} id="notify-status" role="status" aria-live="polite">
        {status && both(status.key)}
      </p>
    </form>
  );
}
