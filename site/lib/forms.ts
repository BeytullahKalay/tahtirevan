/** Görüşme formu: istemci ve sunucu aynı kuralları kullanır. */

/**
 * Netlify'da formlar Netlify Forms'a gider: başvurular Netlify › Forms'ta listelenir, bildirim
 * hi@tahtirevan.com'a gelir (ek hesap ya da anahtar gerekmez). Netlify derlemede NETLIFY=true verir;
 * next.config.ts bunu NEXT_PUBLIC_FORMS olarak tarayıcıya taşır. Yerelde formlar /api/… yoluna gider.
 * Form tanımları (Netlify'ın formu tanıması için): public/__forms.html — alan adları aşağıdakilerle aynı olmalı.
 */
export const netlifyForms = process.env.NEXT_PUBLIC_FORMS === "netlify";
export const CONSULTATION_FORM = "gorusme-talebi";
export const NEWSLETTER_FORM = "atolyeden-mektuplar";

const LABELS = {
  request: { gorusme: "Özel görüşme", katalog: "Katalog", basin: "Basın" },
  projectType: { konut: "Konut", "ic-mimar": "İç mimar / stüdyo", otel: "Otel / kulüp / kurumsal" },
  meeting: { ev: "Ev ziyareti", video: "Video görüşme", telefon: "Telefon" },
} as const;

/** Netlify Forms'a gönderilecek alanlar (bildirim e-postasında bu adlarla görünür). */
export function consultationFields(d: ConsultationInput): Record<string, string> {
  return {
    talep: LABELS.request[d.request],
    "ad-soyad": d.name,
    "e-posta": d.email,
    telefon: d.phone || "-",
    "ulke-sehir": d.location,
    ilgi: d.interest || "-",
    "proje-turu": LABELS.projectType[d.projectType],
    "gorusme-bicimi": LABELS.meeting[d.meeting],
    dil: d.lang,
    not: d.note || "-",
    "kvkk-onayi": d.consent ? "Evet" : "Hayır",
  };
}

/** Netlify Forms'a gönderir (yalnızca Netlify'da çalışır). */
export async function postNetlifyForm(name: string, fields: Record<string, string>) {
  const res = await fetch("/__forms.html", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ "form-name": name, ...fields }).toString(),
  });
  return res.ok;
}

export const PROJECT_TYPES = ["konut", "ic-mimar", "otel"] as const;
export const MEETING_TYPES = ["ev", "video", "telefon"] as const;
export const REQUEST_TYPES = ["gorusme", "katalog", "basin"] as const;

export type ConsultationInput = {
  name: string;
  email: string;
  phone: string;
  location: string;
  interest: string;
  projectType: (typeof PROJECT_TYPES)[number];
  meeting: (typeof MEETING_TYPES)[number];
  request: (typeof REQUEST_TYPES)[number];
  note: string;
  consent: boolean;
  lang: "tr" | "en";
};

export type FieldErrors = Partial<Record<keyof ConsultationInput, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\d\s.-]{7,24}$/;

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function parseConsultation(raw: Record<string, unknown>): { data?: ConsultationInput; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const data: ConsultationInput = {
    name: str(raw.name, 120),
    email: str(raw.email, 160),
    phone: str(raw.phone, 24),
    location: str(raw.location, 120),
    interest: str(raw.interest, 160),
    projectType: str(raw.projectType, 20) as ConsultationInput["projectType"],
    meeting: str(raw.meeting, 20) as ConsultationInput["meeting"],
    request: (str(raw.request, 20) || "gorusme") as ConsultationInput["request"],
    note: str(raw.note, 3000),
    consent: raw.consent === true || raw.consent === "on" || raw.consent === "true",
    lang: raw.lang === "en" ? "en" : "tr",
  };

  if (data.name.length < 2) errors.name = "name";
  if (!EMAIL.test(data.email)) errors.email = "email";
  if (data.phone && !PHONE.test(data.phone)) errors.phone = "phone";
  if (data.location.length < 2) errors.location = "location";
  if (!PROJECT_TYPES.includes(data.projectType)) errors.projectType = "projectType";
  if (!MEETING_TYPES.includes(data.meeting)) errors.meeting = "meeting";
  if (!REQUEST_TYPES.includes(data.request)) errors.request = "request";
  if (!data.consent) errors.consent = "consent";

  return Object.keys(errors).length ? { errors } : { data, errors };
}

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

/** Basit bot denetimi: bal küpü dolu ya da form 2.5 saniyeden kısa sürede gönderildiyse. */
export const looksLikeBot = (raw: Record<string, unknown>) =>
  (typeof raw.website === "string" && raw.website.length > 0) ||
  (typeof raw.elapsed === "number" && raw.elapsed < 2500);

/** Ortam değişkenleriyle yapılandırılan e-posta gönderimi (Resend HTTP API). */
export async function sendMail(opts: { to?: string; subject: string; html: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY;
  const to = opts.to;
  const from = process.env.CONSULTATION_FROM_EMAIL || "Tahtirevan <onboarding@resend.dev>";

  if (!key || !to) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[form] E-posta yapılandırılmadı; başvuru yalnızca kaydedildi:\n", opts.subject, "\n", opts.html);
      return { ok: true, dev: true };
    }
    return { ok: false, error: "not-configured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject: opts.subject, html: opts.html, reply_to: opts.replyTo }),
  });
  return { ok: res.ok, error: res.ok ? undefined : `resend-${res.status}` };
}

// Basit, örnek başına hız sınırı (sunucusuz ortamda en iyi çaba)
const hits = new Map<string, number[]>();
export function rateLimited(ip: string, max = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(ip, list);
  return list.length > max;
}
