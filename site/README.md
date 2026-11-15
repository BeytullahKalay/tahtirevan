# Tahtırevan · koleksiyon sitesi

Next.js (App Router) + TypeScript + Tailwind CSS v4 + Framer Motion. Marka brief'i: `../Tahtirevan-Marka-ve-Web-Sitesi-Brief.md`.

## Çalıştırma

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Ortam değişkenleri için `.env.example` dosyasını `.env.local` olarak kopyalayın.

## Yapı

| Yer | İçerik |
| --- | --- |
| `content/*.json` | Koleksiyonlar, parçalar, kumaşlar, desen kodları, seçenekler. Hepsi TR + EN alanlı. Kod değiştirmeden düzenlenebilir. |
| `content/site.json` | Hero videosu/posteri ve zanaat sayıları. `hero.video` doldurulunca video sessiz döngüyle oynar. |
| `app/(tr)/…` | Türkçe rotalar (`/koleksiyonlar`, `/size-ozel`, `/desenler`, `/hikaye`, `/gorusme` …) |
| `app/(en)/en/…` | İngilizce rotalar (`/en/collections`, `/en/bespoke` …) |
| `components/views/*` | Her sayfanın ortak görünümü; metinler iki dilde ayrı yazılmıştır. |
| `lib/i18n.ts` | Diller, rota çevirileri, dil seçici. Arapça (RTL) ve Rusça buraya eklenir. |
| `app/api/consultation` | Görüşme formu: sunucu doğrulama, bal küpü, hız sınırı, Resend ile e-posta. |

## Görseller

Tüm görseller şimdilik koyu yer tutucudur ve üzerinde istenen çekim türü yazar (ürün portresi, gövde makro detayı, kumaş detayı, zanaat detayı). Gerçek fotoğraf geldiğinde `Media` bileşenine `src` verilmesi yeterlidir; AVIF/WebP ve `srcset` Next/Image ile otomatik üretilir.

## Açık konular (brief'ten)

- **Etro** kumaşı sitede geçici olarak **Mirza** adıyla yer alıyor (`content/fabrics.json`, `nameStatus: provisional`).
- İşçilik saatleri, ölçüler, ağırlıklar ve teslim süreleri örnek değerlerdir; gerçek verilerle değiştirilmeli.
- Kurucu notu ve imzası taslaktır (`components/views/StoryView.tsx`).
- Gizlilik/KVKK ve çerez metinleri taslaktır; hukuki inceleme gerekir.
- Instagram/Pinterest bağlantıları genel adreslere gidiyor; hesap adları gelince güncellenmeli.
- `public/og.svg` geçici paylaşım görselidir; sosyal ağlar için 1200×630 PNG/JPG ile değiştirilmeli.
- Atölye şehri ve fiyat aralığı sitede yer almıyor.
