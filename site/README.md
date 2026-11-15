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

Görseller şimdilik geçicidir ve `lib/media.ts` üzerinden çözülür:

| Çekim türü | Şu an gösterilen |
| --- | --- |
| Kumaş detayı | GRAND kataloğundan kesilen kumaş (`public/fabrics/<kumaş>.jpg`) |
| Ürün portresi / mekân | Arka planı temizlenmiş Serir fotoğrafı (`public/chair/serir.png`), parçanın kumaşının önünde |
| Makro / zanaat detayı | Aynı fotoğraftan koyu zeminli yakın kırpımlar (`public/chair/details/`) |

Gerçek fotoğraf geldiğinde `Media` bileşenine `src` verilmesi yeterlidir; AVIF/WebP ve `srcset` Next/Image ile otomatik üretilir.

## Hareket ve 3B

- `HeroChair`: açılışta koltuk döne döne gelir, imleçle eğilir; kaydırınca döner, sırtındaki kumaşa yaklaşır ve kumaşın içine girer.
- `ChairShowroom` / `ChairStudio`: three.js ile çizilen 3B koltuk. Kaydırınca döner ve yaklaşır, sürükleyerek çevrilir, 11 kumaştan biri seçilince sırt o kumaşı, oturak eşleşen kadifeyi giyer. Ürün sayfasındaki kişiselleştirmede de kullanılır. Model panelden gelir: ürün sayfasında parçanın kendi modeli (Parçalar › Görsel ve 3B), ana sayfada Site ayarları › Kumaş stüdyosu'nda seçilen model. Seçilmemişse ya da açılamazsa hazır koltuk `public/models/koltuk-3.glb` (`ChairCanvas.tsx` → `DEFAULT_MODEL`) kullanılır. Panelde Medya › 3B modeller'e yüklenen ham yapay zekâ GLB'si `payload/chairModel.ts` ile kendiliğinden hazırlanır: yüzler dokudaki renge göre Kumas (sırt), Kadife (oturak) ve Metal diye ayrılır, oturağın üst kenarına ve sırtın kenarlarına siyah biye (`Biye` parçası, ince boru) eklenir, sırta metre ölçeğinde UV verilir, ön yön +z'ye çevrilir. Ham dosya `media/models/kaynak/` altında saklanır; panelde yükseklik ya da "sırtın başladığı yükseklik" değişince model buradan yeniden hazırlanır. Hazır koltuk da aynı kodla `../models/1.glb`'den üretildi.
- `FabricMarquee`: kaydırma hızına göre akan iki sıra kumaş şeridi.
- Hareket azaltma tercihinde kaydırma animasyonları kapanır.

## Açık konular (brief'ten)

- **Etro** kumaşı sitede geçici olarak **Mirza** adıyla yer alıyor (`content/fabrics.json`, `nameStatus: provisional`).
- Katalogdaki Soraya (siyah zeminde buta) ve Zafran (madalyon) görsellerine göre bu iki kumaşın açıklama ve renk notları düzeltildi; ölçek değerleri yine örnektir.
- Ürün fotoğrafındaki koltuğun gövdesi siyah metal borudur; sitedeki "el oyması ceviz gövde" metinleriyle uyuşmuyor.
- İşçilik saatleri, ölçüler, ağırlıklar ve teslim süreleri örnek değerlerdir; gerçek verilerle değiştirilmeli.
- Kurucu notu ve imzası taslaktır (`components/views/StoryView.tsx`).
- Gizlilik/KVKK ve çerez metinleri taslaktır; hukuki inceleme gerekir.
- Instagram/Pinterest bağlantıları genel adreslere gidiyor; hesap adları gelince güncellenmeli.
- `public/og.svg` geçici paylaşım görselidir; sosyal ağlar için 1200×630 PNG/JPG ile değiştirilmeli.
- Atölye şehri ve fiyat aralığı sitede yer almıyor.
