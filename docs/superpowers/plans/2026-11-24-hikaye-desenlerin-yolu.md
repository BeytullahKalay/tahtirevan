# Hikâye: Desenlerin yolu · Uygulama planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hikâye sayfasını, sayfa boyunca inen tek bir altın yol çizgisi üzerinde anlatılan "desenlerin yolu" hikâyesine çevirmek; sayfa iç mimarı görüşmeye davet ederek bitsin.

**Architecture:** Yeni istemci bileşeni `StoryRoad` çizgiyi (kaydırmayla `scaleY`) ve durak işaretlerini (`RoadMark`) çizer. Sunucu bileşeni `StoryView` bütün sayfayı `StoryRoad`'un içine durak satırları olarak dizer: açılış → 4 tarihsel durak → Anadolu → Bugün → koleksiyon durakları → davet. Metinler `StoryView.tsx` içindeki `COPY`'de kalır. Eski `StoryCaravan` silinir.

**Tech Stack:** Next.js 16 (App Router), React, Tailwind v4, Framer Motion 12, Payload katalog (`getCatalog`).

**Spec:** `docs/superpowers/specs/2026-11-23-hikaye-desenlerin-yolu-design.md`

## Global Constraints

- Sitede kurucunun adı, imzası ya da unvanı hiçbir yerde geçmez; metinler marka ağzından konuşur.
- Figürlü çizim yok: tek çizim öğesi 1 px altın çizgi ve 45° dönmüş kare (baklava) işaretler.
- Eski Serir koltuk fotoğrafı kullanılmaz; görseller yalnızca kumaş (`Media shot="fabric"`).
- Kaydırmaya bağlı opaklıkta dizi biçimi yok; gerekiyorsa `useTransform(p, (v) => …)`. Çizgi `scaleY` ile çizilir, opaklıkla değil.
- Sayfa açılır açılmaz görünen içerik (açılış başlığı) CSS sınıflarıyla girer (`.rise`, `.word-rise`), Framer `initial={{opacity:0}}` ile değil.
- Görsel/karartma katmanlarında `Media` bileşeni kullanılır (1 px taşma kuralı onda hazır).
- `prefers-reduced-motion`: çizgi tam çizili, işaretler dolu, hareket yok.
- Port 3100'deki sunucu başka bir oturumun; kapatılmaz ve açıkken `npm run build` çalıştırılmaz.
- Commit yalnızca kullanıcı isterse.
- Kontrol boyutları: 1440×900, 1440×700, 390×844.

## Review Focus

1. **Kumaş yayında değil ya da veritabanı boş:** `getFabric` bilinmeyen kimlikte ilk kumaşa döner; durakta yanlış kumaş görünür. Beklenen: durak görselsiz gösterilir. → Task 2, Step 4.
2. **Hiç yayında koleksiyon yok:** "Koleksiyonlarımız bu yolun duraklarıdır" başlığı boş kalır. Beklenen: koleksiyon bölümü hiç çıkmaz, çizgi davete ulaşır. → Task 2, Step 4.
3. **Telefon (390 px):** çizgi metnin üstüne biner ya da yatay kaydırma çıkar. Beklenen: taşma yok, metin çizginin sağında. → Task 3, Step 2.
4. **Hareket azaltılmış:** çizgi hiç çizilmez, işaretler boş kalır. Beklenen: tam çizili ve dolu. → Task 1, Step 3.
5. **JavaScript yüklenmeden ilk ekran:** başlık görünmez. Beklenen: açılış metni hemen görünür. → Task 2, Step 4.

---

### Task 1: `StoryRoad` ve `RoadMark`

**Files:**
- Create: `site/components/StoryRoad.tsx`

**Interfaces:**
- Produces:
  - `export function StoryRoad({ children, className }: { children: ReactNode; className?: string }): JSX.Element`: `relative` kapsayıcı. CSS değişkeni `--road-x` tanımlar: telefonda `24px`, `lg`'de `calc(var(--gutter) + 6vw)`. Çizgiyi `left: var(--road-x)`'te iki katman olarak çizer: soluk iz (altın, %25) ve kaydırmayla uzayan altın çizgi (`useScroll({ target, offset: ["start 70%", "end 70%"] })` → `scaleY`, `origin-top`). İkisi de `aria-hidden`.
  - `export function RoadMark({ size = "sm" }: { size?: "sm" | "lg" }): JSX.Element`: `absolute`, `left: var(--road-x)`, `-translate-x-1/2`, 45° dönmüş kare. `sm` = 8 px, `lg` = 13 px. Altın çerçeve; görünüme girince içi altınla dolar (`whileInView`, `viewport={{ once: true, margin: "0px 0px -35% 0px" }}`). `aria-hidden`.
  - Kullanım sözleşmesi: her durak satırı `relative` olur ve içeriğini `pl-[calc(var(--road-x)+2rem)]` (lg: `+3.5rem`) ile çizginin sağına iter; `RoadMark` satırın başlık hizasında (`top-[0.55em]` gibi) durur.

- [ ] **Step 1: Bileşeni yaz** (`"use client"`; `useReducedMotion() ?? false`, reduce iken `scaleY` sabit 1 ve işaret baştan dolu).
- [ ] **Step 2: Tür denetimi.** Run: `cd site && npx tsc --noEmit`. Expected: çıktı yok, çıkış kodu 0.
- [ ] **Step 3: Denetim kancaları ve hareket azaltma.** Çizgi öğesine `data-road-line`, işaretlere `data-road-mark` ver (Task 2–3 denetimleri bunları arar). Tarayıcı paneli hareket azaltmayı taklit edemediği için reduce dalını kodu okuyarak doğrula: `reduce` true iken `scaleY` sabit `1`, işaretin başlangıç rengi dolu.

### Task 2: `StoryView`'u yeni akışla yeniden yaz

**Files:**
- Modify: `site/components/views/StoryView.tsx` (tümü)
- Create (geçici, sonunda silinir): `site/app/(tr)/durumhikaye/page.tsx` → `export default function Page() { return <StoryView lang="tr" />; }` (proxy "Yakında" modunu `durum` önekiyle atlar). EN için `site/app/(tr)/durumhikayeen/page.tsx` → `lang="en"`.

**Interfaces:**
- Consumes: `StoryRoad`, `RoadMark` (Task 1); `getCatalog()` → `{ collections, fabrics, getFabric, site }`; `roadStops(lang, collections, getFabric, site.hero.orbs, { stop, start })` → `RoadStop[]` (`kicker`, `name`, `line?`, `href`, `tile?`); `Media`; `Reveal`; `href(lang, "consultation" | "bespoke")`.
- Produces: `export async function StoryView({ lang }: { lang: Lang })` (imza aynı; sayfa dosyaları değişmez).

`COPY[lang]` şekli:

```ts
{
  label: string; title: string; sub: string;
  stops: { city: string; motif: string; text: string; fabric?: string }[]; // 4 tarihsel durak
  crossroads: { label: string; title: string; text: string; fabric: string }; // Anadolu
  today: { label: string; title: string; text: string };
  road: { intro: string; stop: string; start: string; see: string };
  invite: { title: string; sub: string; cta: string; how: string };
}
```

Kesin TR metinler (spec'ten):

| Alan | TR |
|---|---|
| label / title / sub | "Hikâye" / "Her desen bir yoldan geldi." / "Ve bütün yollar Anadolu'dan geçti." |
| stop 1 | Şam · Damask · `sapphire` · "Kumaşa dokunan desene bugün hâlâ şehrin adıyla, damask diyoruz." |
| stop 2 | İran · Buta · `soraya` · "Bir damla, bir alev, bir tohum. Buta İran'dan çıktı, şallarda dünyayı dolaştı." |
| stop 3 | Bozkır · At · `ardente` · "Bozkırın sanatında hayvan bir süs değildi; koşan, bakan bir figürdü." |
| stop 4 | Venedik ve Bursa · Nar · (kumaş yok) · "Nar ve enginar, iki şehrin kadifeleri arasında yüzyıllarca gidip geldi." |
| crossroads | "Anadolu" · "Bütün yollar Anadolu'da buluştu." · "Desenleri kervanlar taşıdı. Hükümdarları, saray kadınlarını ve uzun yola çıkan büyükleri ise tahtırevan: iki hayvanın ya da omuzların taşıdığı, perdeli bir oturak. Adı da bunu söyler: taht ve revan, yürüyen taht." · `zafran` |
| today | "Bugün" · "Yol bir koltukta durur." · "Her tahtırevan sahibine göre yapılırdı. Biz de öyle yapıyoruz: seri üretim yok, stok yok. Her parça tek bir kişi için başlar, sahibini bir ömür boyu taşımak için yapılır ve hikâyesini üç imzada taşır: nakış, püskül ve pirinç damga. Kumaşlarımız ailemizin kumaş geleneğinden gelir." |
| road | "Koleksiyonlarımız bu yolun duraklarıdır." · "Durak" · "Başlangıç" · "Koleksiyonu gör" |
| invite | "Yolun bir sonraki durağı, sizin projeniz." · "Kumaşları birlikte inceleyelim." · "Görüşme talep edin" · "Nasıl çalıştığımız" |

EN: aynı yapıda sade çeviri; title "Every pattern came by a road.", sub "And every road passed through Anatolia.", invite title "The next stop on the road is your project.", sub "Let's look at the fabrics together.", cta "Request a consultation", how "How we work". Diğerleri çevirmenin kararı; adlar (Damask, Buta, Anatolia, Damascus, Iran, the Steppe, Venice and Bursa) korunur.

Sayfa düzeni (tamamı tek `<StoryRoad>` içinde):
1. Açılış satırı: `label`, `h1.display` `title`, `sub`; `.rise` ile girer; `RoadMark` yok (çizgi buradan başlar). Üst boşluk başlığı site başlığının altına iter (`pt-[18vh]` gibi).
2. 4 tarihsel durak: her biri `RoadMark size="sm"` + `Reveal` içinde şehir (`.label text-altin`), `h2` motif, metin; kumaş varsa `Media shot="fabric"` (lg'de metnin sağında, 4:5 ve 4:3 sırayla; telefonda altında tam genişlik) ve altında `"{name} · {motif[lang]}"`.
3. Anadolu: `RoadMark size="lg"`, daha büyük başlık, metin, geniş `Media` (`zafran`).
4. Bugün: `RoadMark size="sm"`, başlık + metin, görsel yok.
5. Koleksiyon durakları: yalnızca `roadStops(...)` boş değilse. Önce `road.intro`, sonra her `RoadStop` için bir satır: `RoadMark size="sm"`, `kicker`, `name` (h3), `line`, varsa `tile` küçük kare (`next/image` `unoptimized`, 96–120 px), `Link href={stop.href}` → `road.see`. **`RoadStops` bileşeni kullanılmaz** (yatay kemerli tasarımı dikey çizgiye oturmuyor; ana sayfa ondan etkilenmesin diye dokunulmaz). Boş "sıradaki durak" satırları yok: sıradaki durak davetin kendisi.
6. Davet: `RoadMark size="lg"`, `invite.title`, `invite.sub`, `Link.btn` → `href(lang, "consultation")`, yanında `Link.btn-quiet` → `href(lang, "bespoke")`. Çizgi bu satırda biter (StoryRoad'un alt kenarı davet satırının işaret hizasında olacak şekilde alt boşluk davetin içinde kalsın).

- [ ] **Step 1: Geçici sayfaları oluştur** (yukarıdaki iki dosya).
- [ ] **Step 2: `StoryView.tsx`'i yeniden yaz.** Kumaş, `fabrics.find((f) => f.id === id)` ile katı aranır; bulunmazsa `undefined` (görselsiz durak). `getFabric` (`lib/catalog.ts:139`) bilinmeyen kimlikte `fabrics[0]` döndürdüğü için duraklarda kullanılmaz; yalnızca `roadStops`'a geçirilir. `StoryCaravan`, `RoadStops`, `Line` tipi ve kurucu notu kaldırılır.
- [ ] **Step 3: Tür denetimi.** Run: `cd site && npx tsc --noEmit`. Expected: çıktı yok.
- [ ] **Step 4: Tarayıcıda denetle** (`http://localhost:3100/durumhikaye`, 1440×900). `javascript_tool` ile:
  - `document.body.innerText` içinde "Her desen bir yoldan geldi.", "Damask", "Buta", "Nar", "Bütün yollar Anadolu'da buluştu.", "Yol bir koltukta durur.", "Yolun bir sonraki durağı, sizin projeniz." var; "Kalay", "Beytullah", "Kurucu" yok.
  - Venedik ve Bursa satırında `img` yok; Şam satırının görseli `sapphire` içeriyor (yanlış kumaş yok).
  - `a[href="/gorusme"]` ve `a[href="/size-ozel"]` var.
  - Sayfayı en alta kaydır → `[data-road-line]` `transform` ölçeği ≈ 1, bütün `[data-road-mark]` dolu.
  - JavaScript'siz ilk ekran: `curl -s http://localhost:3100/durumhikaye | grep -c "Her desen bir yoldan geldi"` → `1` ve başlık öğesinde `style="opacity:0"` yok.
  - Koleksiyon yoksa: `StoryView` içinde koleksiyon dizisi boşken bölüm çıkmamalı; bunu koşulun kendisi taşır (`stops.length > 0 &&`), kodu okuyarak doğrula.
  - Konsolda hata yok (`read_console_messages onlyErrors`).
  - EN: `/durumhikayeen` aynı denetimler İngilizce metinlerle.

### Task 3: Eski kafileyi kaldır ve son kontrol

**Files:**
- Delete: `site/components/StoryCaravan.tsx`
- Modify: `site/app/globals.css` — "Hikâye kafilesi" yorumundan başlayıp `.caravan-hint` reduced-motion bloğuyla biten kısmı sil (bugün ~751–776. satırlar).
- Delete: Task 2'nin geçici sayfaları.
- Keep: `site/lib/emblem.ts`, `site/components/RoadStops.tsx`, `HomeView.tsx`.

- [ ] **Step 1: Silmeden önce** `ListAgents` ile `StoryCaravan.tsx` üzerinde çalışan diğer oturumun durumuna bak; hâlâ çalışıyorsa kullanıcıya söyle ve silme adımını beklet. Sonra sil; `grep -rn "StoryCaravan\|caravan-hint" site/components site/app` → çıktı yok.
- [ ] **Step 2: Üç boyutta denetle** (geçici sayfa silinmeden önce): 1440×900, 1440×700, 390×844. Her birinde `document.documentElement.scrollWidth <= innerWidth`; telefonda ilk durak başlığının sol kenarı `[data-road-line]`'ın sağında (en az 16 px). Ekran görüntüsü al: açılış, Anadolu, davet.
- [ ] **Step 3: Ana sayfa değişmedi.** Run: `git diff --stat site/components/RoadStops.tsx site/components/views/HomeView.tsx`. Expected: boş çıktı.
- [ ] **Step 4: Geçici sayfaları sil, tür denetimi.** Run: `cd site && npx tsc --noEmit`. Expected: çıktı yok.
- [ ] **Step 5: Production build** yalnızca 3100'deki sunucu kapalıysa, CLAUDE.md sırasıyla (build → `site/.next` sil). Sunucu başka oturumdaysa build atlanır ve kullanıcıya söylenir.
- [ ] **Step 6: Commit** yalnızca kullanıcı isterse: `site/components/StoryRoad.tsx`, `StoryView.tsx`, `globals.css`, silinen `StoryCaravan.tsx`, spec ve plan.
