# Pazarlama videosu · çalışma klasörü

Ana tasarım: **kıvrık ceviz ayaklı koltuk** (`kaynak/kivrik-ayak-grid.webp`). Bütün klipler yalnızca bu tasarımdan üretilir; başka koltuk modeli karıştırılmaz.

## Ana kareler (`ana-kareler/`)

| Dosya | Reels'teki yeri | Kamera hareketi |
|---|---|---|
| (gerçek çekim) | 0–3 sn · kumaşın telefonla yakın çekimi, el tüyleri okşuyor | elde, pencere ışığı |
| `01-genis-acilis.png` | 3–7 sn · geniş açılış | yavaşça yaklaşma, güneş kayıyor |
| `02-leopar-yakin.png` | 7–10 sn · leopar başı | neredeyse sabit, hafif odak kayması |
| `03-kol-ve-ceviz-ayak.png` | 10–13 sn · kol ve ceviz ayak | yavaşça yana kayma |
| `04-arka-uc-ceyrek.png` | 13–16 sn · arkadan görünüş | yalnızca ışık süpürmesi |
| `05-final-genis.png` | 16–20 sn · kapanış, logo | sabit, logo girer |

Kurallar: klipler 5 sn; koltuğun etrafında dönen çekim yok (yapay zekâ görmediği yüzü uydurup deseni bozuyor); mümkünse başlangıç ve bitiş karesi birlikte verilir.

Not: Bu kareler 941 piksel genişliğinde ve çoğu yatay. Reels dikey (9:16) olduğu için asıl üretimde her kareyi görseli ürettiğin araçta **ayrı ayrı, dikey ve yüksek çözünürlükte** yeniden üretmek daha iyi sonuç verir. Bu kareler deneme için yeterli.

## Video üzerindeki yazı

> Tasarım önizlemesi · kumaş gerçektir, koltuk siparişle üretilir · 3 ay

Instagram'a yüklerken "AI info / Yapay zekâ bilgisi" etiketi açılır.

## Araç

fal.ai, Claude'a MCP ile bağlı. Sunucu adresi: `https://mcp.fal.ai/mcp-relay` (tarayıcıdan giriş; API anahtarı gerekmez). Her üretim fal kredisi harcar; tahmini maliyet üretimden önce onaylanır. Veo fal'da artık yok; Google'ın yerine geçen modeli Gemini Omni Flash 1.2.

## Deneme sonuçları

**16.11.2026 · `01-genis-acilis.png`, 5 sn, aynı istem (çok yavaş yaklaşma, güneş kayıyor, desen sabit, kamera dönmüyor)**

| Dosya | Model | Tahmini maliyet |
|---|---|---|
| `denemeler/01-kling.mp4` | Kling 3.0 Pro (`fal-ai/kling-video/v3/pro/image-to-video`), sessiz | ~0,70 $ |
| `denemeler/01-gemini.mp4` | Gemini Omni Flash 1.2 (`google/gemini-omni-flash/v1.2/image-to-video`), 1080p, ses var | ~0,14 $ |

Karşılaştırma: `denemeler/01-karsilastirma.png` (sol Kling, sağ Gemini; 0, 2,5 ve 4,9. saniye).

- İkisi de istenen yavaş yaklaşmayı yaptı. Koltuk dönmedi, ceviz ayakların biçimi korundu.
- Desen iki modelde de dağılmadı. Oturaktaki ve sırttaki leopar başları baştan sona aynı yerde ve aynı biçimde kaldı.
- Gemini daha keskin ve kırmızısı kaynağa daha yakın (koyu bordo). Yaklaşması daha belirgin.
- Kling biraz daha yumuşak ve renkleri turuncuya kaçıyor.
- Sonuç: Bu karede Gemini hem daha sadık hem 5 kat ucuz. Bir sonraki sahnede (leopar yakın çekimi) ikisi yine karşılaştırılmalı; yakın çekimde fark daha net görünür.
- Gemini klibinde ses var; montajda kapatılacak.
- Kullanıcı görüntüyü izleyince Kling'i daha çok beğendi; devam modeli Kling 3.0 Pro.

## Reels 1 · beş sahne (`reels-1/`)

**16.11.2026 · kaynak `kaynak/kivrik-ayak-grid-2.webp`, dikey 9:16, Kling 3.0 Pro (sessiz, cfg 0,5).** Sahne planı kullanıcının; sıra, istemler ve en-boy stratejisi Fable'ın önerisi.

Hazırlık zinciri: `girdi/` (kırpım) → `buyutulmus/` (Topaz Upscale Precision, "Low Resolution V2", yüz iyileştirme kapalı) → `dikey/` (Bria Expand ile 9:16'ya duvar ve zemin eklendi; kumaşa dokunulmadı) → `klipler/`.

| Sıra | Klip | Kaynak kare | Süre | Kamera |
|---|---|---|---|---|
| 1 | `klipler/1-texture.mp4` | `buyutulmus/a-texture.png` (2,49:1) | 5 sn | çok yavaş yana kayma |
| 2 | `klipler/2-craft.mp4` | `buyutulmus/b-craft.png` (16:9) | 5 sn | odak kumaştan ahşaba |
| 3 | `klipler/3-back.mp4` | `dikey/c-back.png` (9:16) | 5 sn | sabit, yalnızca ışık |
| 4 | `klipler/4-silhouette.mp4` | `dikey/d-silhouette.png` (9:16) | 5 sn | yavaş yaklaşma |
| 5 | `klipler/5-hero.mp4` | `dikey/e-hero.png` (9:16) | 7 sn | yavaş yaklaşma, final |

Kontrol kareleri: `kontrol/`.

- Beş klipte de leopar başları ve ceviz kolçak baştan sona aynı yerde ve aynı biçimde kaldı; desen dağılmadı.
- Yan görünüşte (4) zemin kayıyor: koyu parlak zemin klibin sonunda halıya dönüşüyor. Montajda ilk 2–3 saniyesi kullanılmalı ya da yeniden üretilmeli.
- Doku (1) ve ahşap (2) yatay; Reels'te üstte ve altta siyah bant içinde, banda yazı konarak kullanılacak.
- Bria'nın ilk iki genişletme denemesi (arka ve final) fal sunucu hatası verdi (500, görsel yok); ikinci denemeler başarılı.
- Tahmini maliyet: Kling 27 sn × 0,14 $ = 3,78 $; Bria 3 × 0,04 $; Topaz 5 kare (fal'ın birim fiyatı 0,01 $, birim sayısı belirsiz). Toplam ~4 $; kesin tutar fal panelinde.

Montaj notu (Fable): 12–15 sn, klip başına 2–3 sn, sert kesmeler, yavaş vurmalı ya da ud-yaylı müzik. Logo yalnızca sonda. "Tasarım önizlemesi · kumaş gerçektir, koltuk siparişle üretilir" yazısı koltuğun göründüğü her sahnede altta küçük.

## Reels 2 · ana final karesi (`reels-2/`)

Plan: `sinematografi-plani.md`. Model: Nano Banana Pro edit (`fal-ai/nano-banana-pro/edit`, 2K, 9:16).

- `ana-final-a/b/c.png`: karanlık oda, güneş huzmesi. Kullanıcı: "yapay zeka olduğu çok belli". Leopar başları büyük (kare yüksekliğinin %11–12'si).
- Bilgisayarda gri film renk ayarı denendi (`kontrol/c-once-sonra.jpg`). Kullanıcı reddetti: kumaşı öne çıkarmıyor.
- Fable'ın teşhisi: oda, zemin, ceviz ve ışık hepsi kahverengi olduğu için kırmızı ayrışmıyor. Çözüm: soğuk gri, nötr oda; yumuşak pencere ışığı; karedeki tek doygun renk kumaş. Gren ve renk ayarı karelere değil, en sonda videoya.
- İki aşamalı üretim:
  1. `oda-duz-kadife.png`: koltuk odada düz kırmızı kadifeyle.
  2. `oda-panthera-a/b.png`: aynı kareye desen giydirildi. Referans: `referans/panthera-3x3.jpg` (kumaş fotoğrafı küçültülüp 3×3 döşendi). Bu, desen ölçeğini küçültmenin işe yarayan yolu oldu; istemle küçültme işe yaramadı.
- Karşılaştırma: `kontrol/oda-karsilastirma.jpg`.
- Tahmini maliyet: karanlık oda 3 kare ~0,45 $ + yeni oda 3 kare ~0,45 $.
- Kullanıcı `oda-panthera-b.png`'yi ana kare olarak onayladı.

### 6. sahne (final) · `klipler/6-final.mp4`

- Başlangıç karesi: `s6-baslangic.png` (B'den, kamera daha yukarıda ve geride). Bitiş karesi: B.
- Model: Kling 3.0 Pro, 5 sn, cfg 0,6, ses kapalı. Kamera vinçle iner gibi alçalıp yavaşça yaklaşıyor.
- Kare kare kontrol (`kontrol/6-final-*`):
  - Desen 4 fps'te bütün klip boyunca yerinde kaldı; kayma ya da erime yok.
  - Oturak önündeki iki leopar yüzü 12 fps'te 3 kat büyütülerek incelendi; göz kırpma ya da yüz hareketi yok.
  - Oda, vazo ve tül sabit.
- **Hata (kullanıcı yakaladı):** Kamera hareket etmiyor, yalnızca koltuk büyüyor. Vazo, pencere, süpürgelik ve tül ilk ve son karede aynı yerde ve aynı boyda (`kontrol/6-final-ilk-son.jpg`). Nedeni başlangıç karesi: Nano Banana "kamerayı geri çek" isteğini odayı aynı bırakıp yalnızca koltuğu küçülterek uyguladı. Kling de iki kare arasında yalnızca koltuğu büyüttü. Benim kontrolüm desen ve yüzlere baktı ama arka planın hareket edip etmediğine bakmadı.
- **Yeni kontrol kuralı:** Her kamera hareketli klipte arka plandaki sabit noktaların (vazo, pencere kenarı, süpürgelik) ilk ve son karede yer ve boy değiştirdiği ölçülecek.

### 6. sahne, ikinci deneme · `klipler/6-final-v2.mp4`

- **Başlangıç karesi:** `s6-baslangic-genis.png`. B %75'e küçültülüp karenin ortasının biraz altına yerleştirildi; çevresi Bria Expand ile dolduruldu (tavan köşesi, daha çok pencere ve tül, daha çok zemin). Koltuğun pikselleri B ile birebir aynı.
- **Model ve hareket:** Kling 3.0 Pro, 5 sn, cfg 0,6. Kamera gerçekten ileri gidiyor: pencere ve tül soldan çıkıyor, tavan köşesi kayboluyor, vazo büyüyüp kayıyor (`kontrol/6-final-v2-ilk-son.jpg`).
- **Kontrol:**
  - Desen 4 fps'te yerinde (`kontrol/6-final-v2-desen.jpg`).
  - Oturak önündeki leopar yüzü 12 fps'te 3 kat büyütülerek incelendi; kırpma ya da hareket yok (`kontrol/6-final-v2-yuz-12fps.jpg`).
- **Tahmini maliyet:** Bria 0,04 $ + Kling 0,70 $.
- **Ders:** Uzaktan görünüşü yeni üretim yerine ana kareyi küçültüp çevresini doldurarak elde et; böylece iki kare geometrik olarak tutarlı olur.
- Tahmini maliyet: başlangıç karesi 0,15 $ + Kling 0,70 $.

### 4., 5. ve 3. sahnelerin kareleri

Nano Banana Pro edit, girdi B + `referans/panthera-3x3.jpg`, sahne başına 2 varyasyon. Karşılaştırma: `kontrol/s4-s5-s3-kareler.jpg` (en solda B).

- **4. sahne, yandan alçak açı (`s4-a.png`, `s4-b.png`):**
  - Oda, ışık ve desen ölçeği B ile tutarlı. Leopar başları kare yüksekliğinin ~%4–5'i.
  - İstenen ön plandaki tül kenarı iki karede de yok; tül yalnızca arkada, pencerenin önünde.
  - `s4-b`'de ceviz ayak B'deki gibi önde ve kıvrık. `s4-a`'da ayak kemer biçiminde, B'den biraz farklı.
- **5. sahne, arkadan çeyrek (`s5-a.png`, `s5-b.png`):**
  - Dikiş ve biye net. Leopar başları ~%4–5.
  - `s5-a`'da arkada vazo var; kamera hareketini ölçmek için iyi bir sabit nokta.
  - Karanlık başlangıç kareleri bilgisayarda üretildi: `s5-a-karanlik.png`, `s5-b-karanlik.png`. Pencere tarafı daha koyu, hafif soğuk; bulut geçiyormuş gibi. Geometri birebir aynı. Karşılaştırma: `kontrol/s5-karanlik-aydinlik.jpg`.
- **3. sahne, ceviz ayak detayı (`s3-a.png`, `s3-b.png`):**
  - Ayak biçimi B ile uyumlu, ahşap damarı iyi.
  - **Kural ihlali:** İki karede de oturak önünde tam bir leopar yüzü var. `s3-a`'da ~%13, `s3-b`'de ~%15 ve keskin. Kural ≤%7. Kling'de göz kırpma riski yüksek.
- Tahmini maliyet: 3 iş × 2 kare × 0,15 $ = ~0,90 $. Karanlık kareler ücretsiz.
- **3. sahne yeniden üretildi (`s3-c.png`, `s3-d.png`):** Kamera yerden ~15 cm yükseklikte; konu ayağın alt yarısı. Karşılaştırma: `kontrol/s3-yeni.jpg`.
  - `s3-c`: Ayak B'deki gibi kalın ve kıvrık; kumaş ayağın üstünü sarıyor. Karede göz ya da tam leopar yüzü yok; sol üstte yalnızca bulanık, kesik bir benekli kürk ve bıyık parçası var (`kontrol/s3-c-ust.jpg`). Ayağın alt solunda B'de olmayan küçük bir oyuk var.
  - `s3-d`: Ayak ince, klasik konik mobilya ayağı; B ile uyuşmuyor. Elendi.
  - Tahmini maliyet: 2 kare ~0,30 $.
- **Kullanıcının seçimi:** 4. sahne `s4-b.png`; 5. sahne `s5-a.png` (başlangıç `s5-a-karanlik.png`); 3. sahne için yeniden üretim istendi, önerilen kare `s3-c.png`.

### 4., 5. ve 3. sahne klipleri (`klipler/`)

Kling 3.0 Pro, 5 sn, cfg 0,6, ses kapalı. İlk ve son kare: `kontrol/3-4-5-ilk-son.jpg`. Genel görünüş (2 fps): `kontrol/*-genel.png`.

- **`4-siluet.mp4`** (başlangıç `s4-b.png`, yalnızca başlangıç karesi):
  - Kamera gerçekten hareket ediyor: pencere ve tül soldan çıkıyor, zeminde yeni derz çizgileri sağdan giriyor.
  - İstenen düz yana kayma yerine kamera koltuğun çevresinde ~20° dönüyor. Son 2 saniyede koltuğun önü (kol ve oturak) görünüyor; bu kısmı yapay zekâ uydurdu.
  - Yan yüzdeki desen bütün klip boyunca aynı düzende. Leopar yüzü 12 fps'te 1,5 kat büyütülerek incelendi; göz kırpma görülmedi (`kontrol/4-siluet-yuz-12fps.png`).
  - **Öneri:** Montajda ilk 3 saniye.
- **`5-arka-isik.mp4`** (başlangıç `s5-a-karanlik.png`, bitiş `s5-a.png`):
  - Kamera sabit; koltuk, vazo ve pencere baştan sona aynı yerde. Bu sahnede istenen buydu.
  - Işık yumuşakça artıyor, pencere aydınlanıyor.
  - Leopar yüzü 12 fps'te değişmiyor (`kontrol/5-arka-isik-yuz-12fps.png`).
  - **Öneri:** Klibin tamamı kullanılabilir.
- **`3-ceviz-ayak.mp4`** (başlangıç `s3-c.png`, yalnızca başlangıç karesi):
  - Kamera yana kayıyor; arkadaki süpürgelik ve duvar kayıyor, ayak sabit ve biçimi bozulmuyor.
  - **Sorun:** Sol üst köşede bulanık bir leopar gözü var (kare seçerken bunu kaçırmıştım). 3,5–4,9. saniyeler arasında göz yavaşça siliniyor ve bıyıklar büyüyor (`kontrol/3-ceviz-ust-12fps.png`, `kontrol/3-ceviz-ust-4fps.png`). 0–3. saniyeler arası sabit.
  - **Öneri:** Montajda ilk 3 saniye; gerekirse sol üst köşe hafif yakınlaştırmayla kadraj dışına alınır.
- Tahmini maliyet: 3 × 0,70 $ = 2,10 $. fal'a yükleme ücretsiz.
- **Ders:** Yalnızca başlangıç karesi verilen kayma çekimlerinde Kling, kamerayı nesnenin etrafında döndürmeye eğilimli. Düz kayma isteniyorsa bitiş karesi de verilmeli. Bitiş karesi, 6. sahnedeki gibi ana kareyi kaydırıp kenarını doldurarak hazırlanabilir.

### 4. sahne, ikinci deneme · `klipler/4-siluet-v2.mp4`

- **Kullanıcının tespiti:** İlk denemede (`4-siluet.mp4`) kamera hareket etmiyordu, koltuk kayıp dönüyordu. Ben bunu "kamera dönüyor" diye yanlış okumuştum.
- **Fable'ın teşhisi:** "Koltuk kıpırdamasın, arka plan kaysın" istemi Kling'e "koltuk kadrajda sabit, dünya dönsün" diye okundu. Gerçek yana kaymada koltuk da kadrajda kayar, hem de arka plandan hızlı.
- **Bitiş karesi** (`s4-b-bitis.png`; ara dosyalar `s4-end/`; hazırlık `kontrol/s4-bitis-hazirlik.jpg`):
  1. BiRefNet ile koltuğun maskesi alındı.
  2. Bria Eraser ile koltuk ve gölgesi odadan silindi.
  3. Boş oda 130 px sola kaydırıldı; sağdaki boş şerit Bria Expand ile dolduruldu ("boş oda, nesne yok, vazo yok").
  4. Kalan gölge izi bir kez daha silindi.
  5. Koltuk, gölgesiyle birlikte 220 px sola yapıştırıldı. Koltuk duvardan 90 px fazla kayıyor; bu gerçek derinlik farkı (paralaks). Koltuğun pikselleri başlangıç karesiyle birebir aynı.
- **Model:** Kling 3.0 Pro, başlangıç `s4-b.png`, bitiş `s4-b-bitis.png`, cfg 0,6, istem Fable'ın.
- **Kontrol** (`kontrol/4-siluet-v2-*`):
  - Koltuk kadrajda ~150 px, pencere ve duvar ~95 px sola kayıyor (1080 genişlikte). Kamera gerçekten kayıyor.
  - Koltuk dönmüyor; önü hiç görünmüyor.
  - Leopar yüzü 6 fps'te 1,5 kat büyütülerek incelendi; göz kırpma ya da biçim değişimi yok.
  - Ayak ve gölge birlikte hareket ediyor.
  - Vazo baştan sona hiç görünmüyor; arada belirip kaybolmuyor.
- **Tahmini maliyet:** BiRefNet + 2 × Bria Eraser + Bria Expand ~0,10 $; Kling 0,70 $.
- **Ders:** Yana kayma için bitiş karesini katmanlı hazırla: koltuğu ayır, odayı az, koltuğu çok kaydır. Böylece Kling hareketi uydurmuyor, yalnızca arasını dolduruyor.

**Vazo tutarlılığı (bütün sahneler):** Vazo ve yan sehpa 6. sahnede (B) ve 5. sahnede var; ikisinde de klip boyunca yerinde duruyor. 4. sahne (yan profil) ve 3. sahne (ayak detayı) açısından görünmüyor. Hiçbir klipte vazo sonradan belirmiyor ya da kaybolmuyor.

### 4. sahne, üçüncü deneme (yay çekimi) · `klipler/4-yay.mp4`

- **Kullanıcının isteği:** `4-siluet-v2` de olmadı; kameranın ve koltuğun kayma hızları uyuşmuyor. İstenen: koltuk sabit ve kadrajın ortasında, kamera onun etrafında ağır ağır yay çizsin. Kullanıcı bitiş karesiz, yalnızca istemle denemeyi seçti.
- **Model:** Kling 3.0 Pro, başlangıç `s4-b.png`, bitiş karesi yok, cfg 0,7. İstem: kavisli rayda ~30° yay, koltuk ortada ve aynı boyda, oda perspektifle dönüyor. İstenmeyenler: döner tabla, koltuğun kendi kendine dönmesi.
- **Kontrol** (`kontrol/4-yay-*`):
  - Koltuk kadrajda yerinde ve aynı boyda kalıyor. Sağ kenarı 0. saniyede 328, son karede 338 px (390 px genişlikte).
  - Koltuğun önü (oturak, karşı kol, ikinci ayak) yavaşça görünür hale geliyor.
  - **Sorun:** Arka duvar kameraya hep düz bakıyor; süpürgelik çizgisi açı değiştirmiyor. Pencere sola çıkıyor, oysa kamera koltuğun önüne doğru dönerken sağa kayması gerekirdi. Sonuç gerçek bir yay çekiminden çok, koltuk döner tablada dönüyormuş gibi okunabilir.
  - Leopar yüzü 12 fps'te 1,5 kat büyütülerek incelendi (`kontrol/4-yay-yuz-12fps.png`). Göz kırpma yok; desen yan yüzün dönüşüyle birlikte kayıyor.
  - Vazo görünmüyor; arada belirmiyor.
- **Tahmini maliyet:** 0,70 $.
- **Kullanıcının kararı:** 4. sahne için `4-yay.mp4` kullanılacak. Kullanıcı yana kaymayı (`4-siluet-v2`) istemiyor; kameranın koltuğu merkezde tutup etrafında yay çizmesini istiyor.

**Reels 2 için seçilen klipler:** 3 `3-ceviz-ayak.mp4` (ilk 3 sn) · 4 `4-yay.mp4` · 5 `5-arka-isik.mp4` · 6 `6-final-v2.mp4`. 1 ve 2. sahneler kullanıcının telefonla çekeceği gerçek kumaş görüntüleri.

## Reels 2 montaj (`reels-2/montaj/`)

Montaj ffmpeg ile yerelde yapıldı; ayrıntılar ve tuzaklar `.claude/skills/reels-montaj/SKILL.md` içinde.

- **Çıktı:** `montaj/cikti/reels-2-taslak-v5.mp4`. Süre 17 sn, 1080×1920, 24 kare/sn, BT.709 ve tv aralığı, ses yok. Kullanıcı onayladı.
  - Eski taslaklar v1–v4 aynı klasörde duruyor, silinmedi.
- **Giriş:** Kullanıcının isteğiyle kumaş desenli giriş kaldırıldı, yerine bir şey konmadı. Video #14110F koyu zeminden yumuşak bir geçişle (ease-out) açılıyor.
- **Akış ve aralıklar:**

  | Zaman | Parça | Kaynak |
  |---|---|---|
  | 0–3 sn | `ara/03.mp4` | `3-ceviz-ayak.mp4`, 0–3 sn |
  | 3–6 sn | `ara/04.mp4` | `4-yay.mp4`, 2–5 sn |
  | 6–9 sn | `ara/05-v2.mp4` | `5-yukselis-v2.mp4`, 1–4 sn |
  | 9–13 sn | `ara/06-geri.mp4` | `6-inis-ham.mp4`, ilk 96 kare **ters çevrilmiş**, yani kamera geri çekilip final karesinde duruyor |
  | 12–13 sn | 1 sn'lik çapraz geçiş | — |
  | 13–17 sn | `ara/kart-v2.mp4` | kapanış kartı |

- **Kapanış kartı:**
  - Koyu zeminde Panthera kumaşından ince bir şerit çok yavaş kayıyor.
  - Amblem 1,0 sn'de, TAHTIREVAN yazısı 1,6 sn'de yumuşakça beliriyor.
  - Parlama ya da patlama efekti yok (kullanıcı istemedi).
  - PNG'ler `kart/logo-kart.html` dosyasından başsız Edge ile alındı.
- **Renk:** `colorbalance=rs=0.015:gs=0.004:bs=-0.006,eq=contrast=1.03,huesaturation=hue=-4:saturation=0.04:colors=r:strength=1`
  - Ölçüm: kırmızının ton kayması −0,04°, doygunluğu +%6.
  - Üstüne hafif halation (opaklık 0,10) ve ince film greni eklendi.
- **Yeni klipler** (Kling 3.0 Pro, her biri ~0,70 $):
  - `6-inis-ham.mp4`: final karesinden ileri ve aşağı doğru üretildi, sonra ters çevrildi. Ölçümde gerçek bir kamera hareketi çıktı.
  - `5-yukselis.mp4`: kullanılmadı. Kamera yükselmedi, koltuk döner tablada dönüyormuş gibi döndü.
  - `5-yukselis-v2.mp4`:
    - Başlangıç ve bitiş kareleri `uretim-v3/s5-alcak.png` ve `s5-yuksek.png`. İkisi de `s5-a.png`'nin aynı genişlikte, yalnızca dikeyde kaydırılmış kırpımları.
    - Koltuk dönmüyor, yüzler bozulmuyor.
    - Hareket düz bir dikey kayma; derinlik farkı yok, yani ücretsiz dijital kaydırmayla eş değer.
- **Ölçüm araçları** `araclar/` klasöründe: `kirmizi-olc.cjs` (kırmızı ton) ve `hareket-olc.cjs` (duvar mı, koltuk mu hareket ediyor).
- **Yayınlarken:**
  - Müzik Instagram'da eklenir; ağır tempolu, ~60 BPM.
  - Instagram'ın "AI info" etiketini aç.
  - Kapak için final karesini (13. saniye civarı) ya da kapanış kartını seç.
