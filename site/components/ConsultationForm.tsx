"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import type { Catalog } from "@/lib/catalog";
import { useCatalog } from "./CatalogProvider";
import { href, type Lang } from "@/lib/i18n";
import { parseConsultation, type FieldErrors } from "@/lib/forms";
import { track } from "./Consent";

const COPY = {
  tr: {
    name: "Ad soyad",
    email: "E-posta",
    phone: "Telefon",
    optional: "isteğe bağlı",
    location: "Ülke / şehir",
    interest: "İlgilendiğiniz parça ya da koleksiyon",
    undecided: "Henüz karar vermedim",
    collection: "koleksiyonun tamamı",
    project: "Proje türü",
    projects: { konut: "Konut", "ic-mimar": "İç mimar / tasarım stüdyosu", otel: "Otel, kulüp ya da kurumsal mekân" },
    meeting: "Tercih ettiğiniz görüşme biçimi",
    meetings: { ev: "Ev ziyareti", video: "Video görüşme", telefon: "Telefon" },
    note: "Not",
    notePh: "Mekân, ölçü, zaman ya da aklınızdaki her şey.",
    consentA: "Kişisel verilerimin bu talep için işlenmesine izin veriyorum.",
    consentLink: "Gizlilik ve KVKK metni",
    submit: "Talebi gönder",
    sending: "Gönderiliyor",
    catalog: "Katalog talebi",
    press: "Basın talebi",
    errors: {
      name: "Lütfen adınızı ve soyadınızı yazın.",
      email: "Geçerli bir e-posta adresi yazın.",
      phone: "Telefon numarası geçerli görünmüyor.",
      location: "Lütfen ülke ve şehir yazın.",
      projectType: "Bir proje türü seçin.",
      meeting: "Bir görüşme biçimi seçin.",
      consent: "Devam etmek için onay gerekiyor.",
      request: "Talep türü geçersiz.",
      generic: "Talebiniz şu anda gönderilemedi. Lütfen biraz sonra tekrar deneyin.",
    },
    thanksLabel: "Talebiniz ulaştı",
    thanks: "Teşekkür ederiz.",
    thanksLine: "24 saat içinde size döneceğiz.",
    back: "Koleksiyona dön",
    selection: "Seçiminiz",
  },
  en: {
    name: "Full name",
    email: "Email",
    phone: "Telephone",
    optional: "optional",
    location: "Country / city",
    interest: "The piece or collection you are interested in",
    undecided: "I have not decided yet",
    collection: "the whole collection",
    project: "Project type",
    projects: { konut: "Private residence", "ic-mimar": "Interior designer / design studio", otel: "Hotel, club or corporate space" },
    meeting: "How would you like to meet?",
    meetings: { ev: "A home visit", video: "A video call", telefon: "A telephone call" },
    note: "Note",
    notePh: "The room, the size, the timing, or anything else on your mind.",
    consentA: "I agree to my personal data being processed for this request.",
    consentLink: "Privacy notice",
    submit: "Send the request",
    sending: "Sending",
    catalog: "Catalogue request",
    press: "Press request",
    errors: {
      name: "Please enter your full name.",
      email: "Please enter a valid email address.",
      phone: "That telephone number does not look right.",
      location: "Please enter your country and city.",
      projectType: "Please choose a project type.",
      meeting: "Please choose how you would like to meet.",
      consent: "Your consent is needed to continue.",
      request: "Invalid request type.",
      generic: "Your request could not be sent just now. Please try again shortly.",
    },
    thanksLabel: "Your request has arrived",
    thanks: "Thank you.",
    thanksLine: "We will be in touch within 24 hours.",
    back: "Back to the collection",
    selection: "Your selection",
  },
};

const field =
  "mt-2 block min-h-[48px] w-full border-0 border-b border-tas/50 bg-transparent px-0 py-2 text-fildisi placeholder:text-tas/70 transition-colors duration-700 focus:border-altin focus:outline-none focus:ring-0";

export function ConsultationForm({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  const cat = useCatalog();
  const { collections, fabrics, getPiece, options, piecesByCollection, typeLabel } = cat;
  const params = useSearchParams();
  const [startedAt] = useState(() => Date.now());
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const thanksRef = useRef<HTMLHeadingElement>(null);

  const pre = useMemo(() => {
    const pieceId = params.get("parca") || "";
    const piece = pieceId ? getPiece(pieceId) : undefined;
    const fabric = fabrics.find((f) => f.id === params.get("kumas"));
    const wood = options.woods.find((w) => w.id === params.get("ahsap"));
    const finish = options.finishes.find((f) => f.id === params.get("kaplama"));
    const size = options.sizes.find((s) => s.id === params.get("olcu"));
    const talep = params.get("talep");
    const proje = params.get("proje");
    const parts = [fabric?.name, wood?.[lang], finish?.[lang], size?.[lang]].filter(Boolean);
    return {
      interest: piece ? `piece:${piece.id}` : "",
      pieceName: piece ? `${piece.name} ${typeLabel(piece.type, lang).toLocaleLowerCase(lang)}` : "",
      selection: parts.join(" · "),
      request: talep === "katalog" ? "katalog" : talep === "basin" ? "basin" : "gorusme",
      projectType: proje === "ic-mimar" || proje === "otel" ? proje : "konut",
    };
  }, [params, lang, getPiece, fabrics, options, typeLabel]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(fd.entries());
    payload.consent = fd.get("consent") === "on";
    payload.lang = lang;
    payload.elapsed = Date.now() - startedAt;

    const interestVal = String(fd.get("interest") || "");
    payload.interest = interestLabel(cat, interestVal, lang, c.undecided, c.collection);
    if (pre.selection && interestVal === pre.interest) {
      payload.note = `${c.selection}: ${pre.selection}\n\n${payload.note || ""}`.trim();
    }

    const { errors: errs } = parseConsultation(payload);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setState("sending");
    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setState("done");
        track("Consultation", { request: String(payload.request), type: String(payload.projectType) });
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => thanksRef.current?.focus(), 400);
      } else {
        if (json.errors) setErrors(json.errors);
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="flex min-h-[50vh] flex-col items-start justify-center" role="status">
        <p className="label">{c.thanksLabel}</p>
        <h2 ref={thanksRef} tabIndex={-1} className="display mt-6 focus:outline-none">
          {c.thanks}
        </h2>
        <p className="lede mt-6">{c.thanksLine}</p>
        <Link href={href(lang, "collections")} className="link-gold label tap mt-12 !text-fildisi">
          {c.back}
        </Link>
      </div>
    );
  }

  const err = (k: keyof FieldErrors) =>
    errors[k] ? (
      <p id={`err-${k}`} className="mt-2 text-sm text-[#e0a39b]" role="alert">
        {c.errors[k as keyof typeof c.errors]}
      </p>
    ) : null;
  const aria = (k: keyof FieldErrors) => ({
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `err-${k}` : undefined,
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-x-10 gap-y-10 md:grid-cols-2">
      <input type="hidden" name="request" value={pre.request} />
      {pre.request !== "gorusme" && (
        <p className="label md:col-span-2 !text-altin">{pre.request === "katalog" ? c.catalog : c.press}</p>
      )}

      <div>
        <label htmlFor="f-name" className="label">{c.name}</label>
        <input id="f-name" name="name" autoComplete="name" required className={field} {...aria("name")} />
        {err("name")}
      </div>
      <div>
        <label htmlFor="f-email" className="label">{c.email}</label>
        <input id="f-email" name="email" type="email" autoComplete="email" required className={field} {...aria("email")} />
        {err("email")}
      </div>
      <div>
        <label htmlFor="f-phone" className="label">
          {c.phone} <span className="normal-case tracking-normal">({c.optional})</span>
        </label>
        <input id="f-phone" name="phone" type="tel" autoComplete="tel" className={field} {...aria("phone")} />
        {err("phone")}
      </div>
      <div>
        <label htmlFor="f-location" className="label">{c.location}</label>
        <input id="f-location" name="location" autoComplete="address-level2" required className={field} {...aria("location")} />
        {err("location")}
      </div>

      <div className="md:col-span-2">
        <label htmlFor="f-interest" className="label">{c.interest}</label>
        <select id="f-interest" name="interest" defaultValue={pre.interest} className={`${field} appearance-none`}>
          <option value="" className="bg-gece">{c.undecided}</option>
          {collections.map((col) => (
            <optgroup key={col.id} label={col.name[lang]} className="bg-gece">
              <option value={`collection:${col.id}`} className="bg-gece">
                {col.name[lang]}, {c.collection}
              </option>
              {piecesByCollection(col.id).map((p) => (
                <option key={p.id} value={`piece:${p.id}`} className="bg-gece">
                  {p.name} · {typeLabel(p.type, lang)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {pre.selection && (
          <p className="mt-3 text-sm text-tas">
            {c.selection}: <span className="text-fildisi">{pre.pieceName}</span> · {pre.selection}
          </p>
        )}
      </div>

      <fieldset>
        <legend className="label">{c.project}</legend>
        <div className="mt-4 flex flex-col gap-3">
          {(Object.keys(c.projects) as (keyof typeof c.projects)[]).map((k) => (
            <label key={k} className="tap flex cursor-pointer items-center gap-3">
              <input type="radio" name="projectType" value={k} defaultChecked={pre.projectType === k} className="h-4 w-4 accent-[#B08D57]" />
              {c.projects[k]}
            </label>
          ))}
        </div>
        {err("projectType")}
      </fieldset>

      <fieldset>
        <legend className="label">{c.meeting}</legend>
        <div className="mt-4 flex flex-col gap-3">
          {(Object.keys(c.meetings) as (keyof typeof c.meetings)[]).map((k, i) => (
            <label key={k} className="tap flex cursor-pointer items-center gap-3">
              <input type="radio" name="meeting" value={k} defaultChecked={i === 0} className="h-4 w-4 accent-[#B08D57]" />
              {c.meetings[k]}
            </label>
          ))}
        </div>
        {err("meeting")}
      </fieldset>

      <div className="md:col-span-2">
        <label htmlFor="f-note" className="label">{c.note}</label>
        <textarea id="f-note" name="note" rows={4} placeholder={c.notePh} className={`${field} resize-y`} />
      </div>

      {/* Bal küpü */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="md:col-span-2">
        <label className="flex cursor-pointer items-start gap-4">
          <input type="checkbox" name="consent" className="mt-1.5 h-4 w-4 shrink-0 accent-[#B08D57]" {...aria("consent")} />
          <span className="text-[15px] text-fildisi/85">
            {c.consentA}{" "}
            <Link href={href(lang, "privacy")} className="link-gold is-static text-fildisi" target="_blank">
              {c.consentLink}
            </Link>
          </span>
        </label>
        {err("consent")}
      </div>

      <div className="flex flex-col items-start gap-4 md:col-span-2">
        <button type="submit" className="btn" disabled={state === "sending"}>
          {state === "sending" ? c.sending : c.submit}
        </button>
        {state === "error" && (
          <p className="text-sm text-[#e0a39b]" role="alert">
            {c.errors.generic}
          </p>
        )}
      </div>
    </form>
  );
}

function interestLabel(cat: Catalog, v: string, lang: Lang, undecided: string, whole: string) {
  const { getPiece, typeLabel, collections } = cat;
  if (!v) return undecided;
  const [kind, id] = v.split(":");
  if (kind === "piece") {
    const p = getPiece(id);
    return p ? `${p.name} ${typeLabel(p.type, lang)}` : undecided;
  }
  const col = collections.find((c) => c.id === id);
  return col ? `${col.name[lang]}, ${whole}` : undecided;
}
