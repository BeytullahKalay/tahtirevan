"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Mark } from "../Brand";
import { looksLikeBot, netlifyForms, postNetlifyForm } from "@/lib/forms";
import { PREORDER_FORM, PRODUCTS, parsePreorder, priceAmount, type PreorderErrors, type ProductKey } from "@/lib/preorder";

/**
 * Reklam testinin sipariş sayfası. Akış: sayfa → "Sipariş ver" → kısa form → "Bekleme listesindesiniz".
 * Ödeme alınmaz. Üç adım sayılır (sayfayı açtı / Sipariş ver'e bastı / formu gönderdi): Panel › Reklam testi.
 */

type Props = { product: ProductKey; open: boolean; price: string; priceNote: string; leadTime: string };

const ERR = {
  name: "Lütfen adınızı ve soyadınızı yazın.",
  phone: "Sizi arayabilmemiz için geçerli bir telefon numarası yazın.",
  email: "E-posta adresi geçerli görünmüyor.",
  consent: "Devam etmek için onay gerekiyor.",
  generic: "Şu anda gönderilemedi. Lütfen biraz sonra tekrar deneyin ya da hi@tahtirevan.com adresine yazın.",
};

const field =
  "mt-2 block min-h-[48px] w-full border-0 border-b border-tas/50 bg-transparent px-0 py-2 text-fildisi placeholder:text-tas/70 transition-colors duration-700 focus:border-altin focus:outline-none focus:ring-0";

/** Reklamdan mı geldi? Bağlantıdaki etiket (utm_source), Meta'nın eklediği fbclid ya da önceki sayfa. Oturum boyunca saklanır. */
function detectSource() {
  try {
    const p = new URLSearchParams(window.location.search);
    let s = p.get("utm_source") || (p.get("fbclid") ? "meta" : "");
    if (!s && /instagram\./i.test(document.referrer)) s = "instagram";
    if (!s && /facebook\.|\/\/fb\./i.test(document.referrer)) s = "meta";
    if (s) {
      sessionStorage.setItem("tr-src", s);
      return s;
    }
    const saved = sessionStorage.getItem("tr-src");
    if (saved) return saved;
    // Sitenin kendi sayfalarından (anasayfa, koleksiyon) gelen ziyaretçi
    if (document.referrer && new URL(document.referrer).host === window.location.host) return "site";
    return "diger";
  } catch {
    return "diger";
  }
}

function count(type: "view" | "click", product: ProductKey, source: string) {
  const body = JSON.stringify({ type, product, source });
  try {
    if (navigator.sendBeacon?.("/api/on-siparis/olay", new Blob([body], { type: "application/json" }))) return;
  } catch {}
  fetch("/api/on-siparis/olay", { method: "POST", body, keepalive: true }).catch(() => {});
}

export function PreorderView({ product, open, price, priceNote, leadTime }: Props) {
  const name = PRODUCTS[product].name;
  const [source, setSource] = useState("diger");
  const [formOpen, setFormOpen] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [queue, setQueue] = useState<number | null>(null);
  const [errors, setErrors] = useState<PreorderErrors>({});
  const [ctaVisible, setCtaVisible] = useState(true);
  const startedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);
  const formSection = useRef<HTMLElement>(null);
  const heroCta = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  // Sayfa açılışı: oturum başına bir kez sayılır (yenileme sayıyı şişirmesin).
  useEffect(() => {
    const s = detectSource();
    setSource(s);
    try {
      const k = `tr-view-${product}`;
      if (sessionStorage.getItem(k)) return;
      sessionStorage.setItem(k, "1");
    } catch {}
    count("view", product, s);
  }, [product]);

  // Telefonda alttaki sabit "Sipariş ver" çubuğu: üstteki düğme ekrandan çıkınca görünür.
  useEffect(() => {
    const el = heroCta.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setCtaVisible(e.isIntersecting || e.boundingClientRect.top > 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function openForm() {
    if (!formOpen) {
      setFormOpen(true);
      startedAt.current = Date.now();
      count("click", product, source);
    }
    requestAnimationFrame(() => {
      formSection.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => formRef.current?.querySelector<HTMLInputElement>("[name=name]")?.focus({ preventScroll: true }), 500);
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw: Record<string, unknown> = Object.fromEntries(fd.entries());
    raw.consent = fd.get("consent") === "on";
    raw.product = product;
    raw.source = source;
    raw.elapsed = Date.now() - startedAt.current;

    const { data, errors: errs } = parsePreorder(raw);
    setErrors(errs);
    if (!data) {
      formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`)?.focus();
      return;
    }
    setState("sending");
    try {
      const api = fetch("/api/on-siparis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(raw),
      }).then(async (r) => ({ ok: r.ok, json: (await r.json().catch(() => ({}))) as { ok?: boolean; queue?: number | null; errors?: PreorderErrors } }));
      // Netlify'da bildirim e-postası (hi@tahtirevan.com) için Netlify Forms'a da gönderilir.
      const mail =
        netlifyForms && !looksLikeBot(raw)
          ? postNetlifyForm(PREORDER_FORM, {
              urun: name,
              "ad-soyad": data.name,
              telefon: data.phone,
              "e-posta": data.email || "-",
              sehir: data.city || "-",
              not: data.note || "-",
              kaynak: data.source,
              "kvkk-onayi": "Evet",
            }).catch(() => false)
          : Promise.resolve(false);
      const [res, mailed] = await Promise.all([api.catch(() => ({ ok: false, json: {} as { ok?: boolean; queue?: number | null; errors?: PreorderErrors } })), mail]);
      if ((res.ok && res.json.ok) || mailed) {
        setQueue(res.json.queue ?? null);
        setState("done");
        requestAnimationFrame(() => {
          formSection.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          setTimeout(() => doneRef.current?.focus({ preventScroll: true }), 500);
        });
      } else {
        if (res.json.errors) setErrors(res.json.errors);
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  const err = (k: keyof PreorderErrors) =>
    errors[k] ? (
      <p id={`err-${k}`} className="mt-2 text-sm text-[#e0a39b]" role="alert">
        {ERR[k]}
      </p>
    ) : null;
  const aria = (k: keyof PreorderErrors) => ({
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `err-${k}` : undefined,
  });

  const showSticky = open && !ctaVisible && !formOpen && state !== "done";

  return (
    <>
      <header className="flex items-center justify-between px-[var(--gutter)] py-5">
        <a href="/" className="flex items-center gap-3 text-fildisi" aria-label="Tahtırevan">
          <Mark className="h-8 w-8 shrink-0 text-altin" />
          <span className="wordmark">Tahtırevan</span>
        </a>
        <a href="/koleksiyonlar/kurulus-serisi" className="link-gold is-static label tap !text-fildisi">
          Kuruluş serisi
        </a>
      </header>

      <main id="main">
        {/* Ürün, fiyat, Sipariş ver */}
        <section className="grid gap-10 px-[var(--gutter)] pb-16 pt-4 lg:grid-cols-12 lg:gap-16 lg:pb-24 lg:pt-8">
          <div className="lg:order-2 lg:col-span-6 lg:col-start-7 lg:self-center">
            <p className="label">Kırk Kat · Siparişle, elde yapılır</p>
            <h1 className="display mt-4">Geçiş</h1>
            <p className="display-sm mt-1 text-tas">berjer</p>
            <p className="lede mt-8 max-w-[44ch] text-fildisi/90">
              Altından laciverde on dört kadife bant. Her bant ayrı dolgulanır, aralarından ince pirinç rengi biye geçer.
              Gül kurusu bantta, parçanın numarasını taşıyan pirinç bir damga.
            </p>

            <dl className="mt-10 grid max-w-[520px] grid-cols-2 gap-x-8 gap-y-5 border-t hairline pt-6 text-[15px]">
              <div>
                <dt className="label">Teslim</dt>
                <dd className="mt-1 text-fildisi">{leadTime}</dd>
              </div>
              <div>
                <dt className="label">Rezervasyon</dt>
                <dd className="mt-1 text-fildisi">Ücretsiz</dd>
              </div>
              <div className="col-span-2">
                <dt className="label">Kumaş</dt>
                <dd className="mt-1 text-fildisi">On renk kadife, altından laciverde geçiş</dd>
              </div>
            </dl>

            <div className="mt-10" ref={heroCta}>
              {price ? (
                <PriceTag price={price} note={priceNote} />
              ) : (
                <p className="text-fildisi/85">Fiyat, görüşmede seçtiğiniz ölçüye göre paylaşılır.</p>
              )}
              {open ? (
                <>
                  <button type="button" onClick={openForm} className="btn mt-8 w-full sm:w-auto">
                    Sipariş ver
                  </button>
                  <p className="mt-4 max-w-[46ch] text-sm text-tas">
                    Sıranızı ayırır. Şimdi ödeme alınmaz; sizi arayıp kumaşı, ölçüyü ve teslim tarihini birlikte netleştiririz.
                  </p>
                  <a href="/gorusme" className="link-gold is-static label tap mt-6 inline-block !text-fildisi">
                    Önce görüşmek isterim
                  </a>
                </>
              ) : (
                <p className="mt-8 max-w-[46ch] text-fildisi/85">
                  Bu dönemin sırası doldu. Yeni sıra açıldığında haber almak için{" "}
                  <a className="link-gold is-static" href="mailto:hi@tahtirevan.com">hi@tahtirevan.com</a> adresine yazın.
                </p>
              )}
            </div>
          </div>

          <div className="lg:order-1 lg:col-span-5">
            <Film />
          </div>
        </section>

        {/* Yakın görünüm */}
        <section className="px-[var(--gutter)] pb-16 lg:pb-24">
          <div className="grid gap-4 md:grid-cols-[938fr_590fr]">
            <figure>
              <Image src="/siparis/gecis-genel.webp" alt="Geçiş berjeri, üç çeyrek açıdan" width={938} height={1024} unoptimized loading="lazy" className="h-auto w-full" />
              <figcaption className="label mt-3">On dört bant, altından laciverde</figcaption>
            </figure>
            <figure>
              <Image src="/siparis/gecis-damga.webp" alt="Gül kurusu bantta pirinç damga" width={590} height={1024} unoptimized loading="lazy" className="h-auto w-full" />
              <figcaption className="label mt-3">Numaralı pirinç damga</figcaption>
            </figure>
          </div>
        </section>

        {/* Nasıl işler */}
        <section className="border-t hairline px-[var(--gutter)] py-16 lg:py-24">
          <h2 className="label">Nasıl işler</h2>
          <ol className="mt-8 grid gap-10 md:grid-cols-3">
            {[
              ["Sıranızı ayırın", "Kısa formu doldurun. Ödeme alınmaz, hiçbir şeyi bağlamaz."],
              ["Sizi arayalım", "Kumaşı, ölçüyü ve teslim tarihini telefonda birlikte netleştiririz. Kapora bu konuşmadan sonra, siz karar verince."],
              ["Elde yapılır", `Parça yalnızca sizin için yapılır, ${leadTime.toLocaleLowerCase("tr")} içinde teslim edilir. Yapım boyunca atölyeden fotoğraf gönderilir.`],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-5">
                <span className="font-serif text-3xl leading-none text-altin">{i + 1}</span>
                <div>
                  <h3 className="display-sm !text-2xl">{t}</h3>
                  <p className="mt-3 max-w-[38ch] text-fildisi/80">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Form ve bekleme listesi */}
        <section
          ref={formSection}
          id="siparis-formu"
          className={`scroll-mt-6 border-t hairline px-[var(--gutter)] py-16 lg:py-24 ${formOpen || state === "done" ? "" : "hidden"}`}
        >
          {state === "done" ? (
            <div className="max-w-[640px]" role="status">
              <p className="label !text-altin">Bekleme listesindesiniz</p>
              <h2 ref={doneRef} tabIndex={-1} className="display-md mt-5 focus:outline-none">
                Sıranız alındı.
              </h2>
              {queue != null && (
                <p className="mt-8 flex items-baseline gap-4">
                  <span className="label">Sıra numaranız</span>
                  <span className="font-serif text-5xl font-light text-altin">{String(queue).padStart(2, "0")}</span>
                </p>
              )}
              <p className="lede mt-8">
                {name} siparişle, elde yapılıyor. Birkaç gün içinde sizi arayıp kumaşı, ölçüyü ve teslim tarihini birlikte netleştireceğiz.
              </p>
              <p className="mt-6 text-tas">Şu an hiçbir ödeme alınmadı. Sorunuz olursa: <a className="link-gold is-static text-fildisi" href="mailto:hi@tahtirevan.com">hi@tahtirevan.com</a></p>
            </div>
          ) : (
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <h2 className="display-md">Sıranızı ayırın</h2>
                <p className="mt-6 max-w-[40ch] text-tas">
                  Birkaç bilgi yeterli. Sizi arayıp ayrıntıları birlikte netleştireceğiz. Şimdi ödeme alınmaz.
                </p>
              </div>
              <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-x-10 gap-y-9 md:grid-cols-2 lg:col-span-7 lg:col-start-6">
                <div>
                  <label htmlFor="p-name" className="label">Ad soyad</label>
                  <input id="p-name" name="name" autoComplete="name" required className={field} {...aria("name")} />
                  {err("name")}
                </div>
                <div>
                  <label htmlFor="p-phone" className="label">Telefon</label>
                  <input id="p-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="05xx xxx xx xx" className={field} {...aria("phone")} />
                  {err("phone")}
                </div>
                <div>
                  <label htmlFor="p-email" className="label">
                    E-posta <span className="normal-case tracking-normal">(isteğe bağlı)</span>
                  </label>
                  <input id="p-email" name="email" type="email" autoComplete="email" className={field} {...aria("email")} />
                  {err("email")}
                </div>
                <div>
                  <label htmlFor="p-city" className="label">
                    Şehir <span className="normal-case tracking-normal">(isteğe bağlı)</span>
                  </label>
                  <input id="p-city" name="city" autoComplete="address-level2" className={field} />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="p-note" className="label">
                    Not <span className="normal-case tracking-normal">(isteğe bağlı)</span>
                  </label>
                  <textarea id="p-note" name="note" rows={3} placeholder="Parçanın duracağı yer, renk isteği, aranmak istediğiniz saat…" className={`${field} resize-y`} />
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
                      Bilgilerimin bu ön sipariş için benimle iletişime geçilmesi amacıyla işlenmesine izin veriyorum. Bilgiler başka bir amaçla kullanılmaz ve paylaşılmaz.{" "}
                      <a href="/gizlilik" target="_blank" className="link-gold is-static text-fildisi">Gizlilik ve KVKK</a>
                    </span>
                  </label>
                  {err("consent")}
                </div>

                <div className="flex flex-col items-start gap-4 md:col-span-2">
                  <button type="submit" className="btn w-full sm:w-auto" disabled={state === "sending"}>
                    {state === "sending" ? "Gönderiliyor" : "Sıramı ayır"}
                  </button>
                  {state === "error" && (
                    <p className="text-sm text-[#e0a39b]" role="alert">{ERR.generic}</p>
                  )}
                </div>
              </form>
            </div>
          )}
        </section>

        <footer className="border-t hairline px-[var(--gutter)] py-8 pb-28 sm:pb-8">
          <p className="label">© Tahtırevan · hi@tahtirevan.com</p>
        </footer>
      </main>

      {/* Telefonda alttaki sabit çubuk */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t hairline bg-gece/95 px-[var(--gutter)] py-3 backdrop-blur transition-transform duration-500 sm:hidden ${showSticky ? "translate-y-0" : "translate-y-full"}`}
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        aria-hidden={!showSticky}
      >
        <span className="font-serif text-xl text-fildisi">{name}</span>
        <button type="button" onClick={openForm} className="btn !min-h-[44px] !py-3" tabIndex={showSticky ? 0 : -1}>
          Sipariş ver
        </button>
      </div>
    </>
  );
}

/**
 * Fiyat: lüks markalardaki gibi sakin. Büyük, kalın bir rakam yerine ince serif, para birimi küçük ve
 * aralıklı, üstünde "Fiyat" etiketi, altında neyin dahil olduğu. "147.500 TL", "147500₺" gibi yazımları toparlar.
 */
function PriceTag({ price, note }: { price: string; note: string }) {
  const amount = priceAmount(price);
  return (
    <div>
      <p className="label">Fiyat</p>
      {amount ? (
        <p className="mt-3 flex items-baseline gap-3 text-fildisi">
          <span className="font-serif text-[2.1rem] font-light leading-none tracking-[0.04em] lg:text-[2.5rem]">{amount}</span>
          <span className="label !text-fildisi/70">TL</span>
        </p>
      ) : (
        <p className="mt-3 font-serif text-[2.1rem] font-light leading-none text-fildisi lg:text-[2.5rem]">{price}</p>
      )}
      {note && <p className="mt-3 max-w-[46ch] text-sm text-tas">{note}</p>}
    </div>
  );
}

/** Reklamdaki film: sessiz başlar, ekrandan çıkınca durur. */
function Film() {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative mx-auto aspect-[9/16] w-full max-w-[460px] overflow-hidden bg-black lg:h-[min(calc(100svh-7rem),820px)] lg:w-auto lg:max-w-none">
      <video
        ref={ref}
        src="/siparis/gecis-film.mp4"
        poster="/siparis/gecis-film-poster.webp"
        muted={muted}
        loop
        playsInline
        autoPlay
        preload="metadata"
        className="h-full w-full object-cover"
        aria-label="Geçiş berjeri filmi"
      />
      <button
        type="button"
        onClick={() => {
          const v = ref.current;
          if (!v) return;
          v.muted = !muted;
          setMuted(!muted);
          if (muted) v.play().catch(() => {});
        }}
        className="label absolute bottom-4 right-4 border border-fildisi/40 bg-gece/60 px-4 py-2.5 !text-fildisi backdrop-blur"
      >
        {muted ? "Sesi aç" : "Sesi kapat"}
      </button>
    </div>
  );
}
