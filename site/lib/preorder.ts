/**
 * Reklam testi (sipariş sayfası) için istemci ve sunucunun ortak kuralları.
 * Sayfa: app/(siparis)/siparis/gecis · API: app/api/on-siparis · Panel: Reklam testi
 */

export const PREORDER_FORM = "on-siparis"; // Netlify Forms adı (bildirim e-postası için), public/__forms.html ile aynı

export const PRODUCTS = {
  gecis: { name: "Geçiş berjeri" },
} as const;
export type ProductKey = keyof typeof PRODUCTS;
export const isProduct = (v: unknown): v is ProductKey => typeof v === "string" && v in PRODUCTS;

export type PreorderInput = {
  name: string;
  phone: string;
  email: string;
  city: string;
  note: string;
  consent: boolean;
  product: ProductKey;
  source: string;
};
export type PreorderErrors = Partial<Record<"name" | "phone" | "email" | "consent", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\d\s.-]{10,24}$/;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Ziyaretçinin nereden geldiği: reklam bağlantısındaki etiket (utm_source) ya da Meta'nın eklediği fbclid. */
export function cleanSource(v: unknown) {
  const s = str(v, 40).toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return s || "diger";
}

export function parsePreorder(raw: Record<string, unknown>): { data?: PreorderInput; errors: PreorderErrors } {
  const errors: PreorderErrors = {};
  const data: PreorderInput = {
    name: str(raw.name, 120),
    phone: str(raw.phone, 24),
    email: str(raw.email, 160),
    city: str(raw.city, 80),
    note: str(raw.note, 2000),
    consent: raw.consent === true || raw.consent === "on" || raw.consent === "true",
    product: isProduct(raw.product) ? raw.product : "gecis",
    source: cleanSource(raw.source),
  };
  if (data.name.length < 2) errors.name = "name";
  if (!PHONE.test(data.phone) || data.phone.replace(/\D/g, "").length < 10) errors.phone = "phone";
  if (data.email && !EMAIL.test(data.email)) errors.email = "email";
  if (!data.consent) errors.consent = "consent";
  return Object.keys(errors).length ? { errors } : { data, errors };
}

/** Türkiye saatine göre gün (YYYY-MM-DD); sayaç raporu günlere bu alanla ayrılır. */
export const istanbulDay = (d = new Date()) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" });

/** Arama motoru ve önizleme botları sayılmasın. */
export const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|meta-externalagent|preview|headless|lighthouse/i;
