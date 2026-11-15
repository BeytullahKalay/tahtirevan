"use client";

import { useState } from "react";
import { UI, type Lang } from "@/lib/i18n";

export function Newsletter({ lang }: { lang: Lang }) {
  const t = UI[lang].footer;
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [startedAt] = useState(() => Date.now());

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fd.get("email"),
          website: fd.get("website"),
          lang,
          elapsed: Date.now() - startedAt,
        }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="font-serif text-2xl italic leading-snug text-fildisi" role="status">
        {t.subscribed}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md" noValidate={false}>
      <label htmlFor="nl-email" className="sr-only">
        {t.email}
      </label>
      <div className="flex items-end gap-4 border-b border-tas/60 pb-2 transition-colors duration-700 focus-within:border-altin">
        <input
          id="nl-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={t.email}
          className="min-h-[44px] w-full bg-transparent text-fildisi placeholder:text-tas focus:outline-none"
        />
        <button type="submit" className="label tap link-gold shrink-0 !text-fildisi" disabled={state === "sending"}>
          {t.subscribe}
        </button>
      </div>
      {/* Bal küpü: insanlar görmez, botlar doldurur */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {state === "error" && (
        <p className="mt-3 text-sm text-fildisi/80" role="alert">
          {t.error}
        </p>
      )}
    </form>
  );
}
