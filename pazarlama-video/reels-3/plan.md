# Reels 3 · Mayura koltuk · "Çayırda gece çekimi" (taslak, onay bekliyor)

Hazırlayan: Claude, Fable'ın (yönetmen gözüyle) görüşüyle. Tarih: 17.11.2026.
**Onay gelmeden hiçbir görsel ya da video üretilmeyecek.**

- Kaynak kare: `kaynak/cayir-tavus.webp` (1672×941, yatay)
- Kumaş: **Mayura**: kuyruğunu açan tavus kuşu; petrol mavisi, zümrüt, bronz; 54 cm rapor. Dosya: `site/public/fabrics/mayura.jpg`
- Koltuk: ayaksız, yuvarlak, heykel gibi bir koltuk. Reels 2'deki ceviz ayaklı koltuktan **farklı bir tasarım**. Bu videoya başka bir koltuk karışmayacak.

## 1. Kaynak kareye bakış

**İyi olanlar**
- "Çayıra kurulmuş bir fotoğraf stüdyosu" fikri gerçek bir fikir. Görünen softbox'lar ışığın nereden geldiğini açıklıyor. Reddedilen "karanlık oda + tepeden ışık huzmesi" görüntüsünde bu yoktu, o yüzden yapay duruyordu.
- Koltuğun biçimi sade. Farklı açılarda aynı kalması kolay olur.
- Petrol mavisi ve zümrüt, koyu yeşil çimenle zengin bir renk uyumu kuruyor.

**Riskli olanlar** (Fable da ben de aynı fikirdeyiz)
1. **Kare çok karanlık.** Mayura'nın zemini siyah. Koltuğun gölgede kalan yarısı geceye karışıyor ve kumaş görünmüyor. Bu, Reels 2'de "kumaşı gizliyor" diye reddettiğin mat renk hatasının aynısı. Ayrıca fiziksel olarak da yanlış: o kadar yakındaki iki softbox koltuğu çok daha güçlü aydınlatırdı.
2. **Desen gerçek kumaşa benzemiyor.** Gerçek Mayura'da büyük kuşlar ve işleme hissi var. Koltukta ise sık bir vitray mozaiği gibi okunuyor, tavus kuşu yalnızca sırtta seçiliyor. Müşteri desene bakarak sipariş vereceği için bunun düzeltilmesi şart. Reels 2'deki gibi, kumaş 3×3 döşenmiş referansla yeniden uygulanacak.
3. **Gözler.** Her desen tekrarında iki tavus kuşu başı (gerçek göz) ve yaklaşık beş "tüy gözü" var. Başlar en çok görünen yüzeyde, sırtta duruyor. Bu, Reels 1'deki **göz kırpma riskinin aynısı**.
4. **Dikey kırpım olmaz.** 16:9 kareden 9:16 kesince koltuk kenarlara değiyor ve iki softbox da kadrajdan çıkıyor. Yeni bir **dikey ana kare** gerekiyor. Mevcut kare de düşük çözünürlüklü (941 px yükseklik).

## 2. Fikir: "Gece çekimi"

Mavi saatte bir çayır. Ekran neredeyse siyahken **softbox'lar flaş sesiyle yanıyor** ve tavus kuşlu koltuk karanlıktan çıkıyor. Instagram'da ilk 1,5 saniye kaydırmayı durduracak an bu.

**Bütün sahneler Kling ile üretilecek** (17.11.2026 kararı; telefon çekimi yok). Yakın çekimlerin ana kareleri gerçek kumaş dosyası `kumas-buyutulmus/mayura-hd.jpg` (3000 px) referans alınarak yapılacak, böylece desen gerçek kumaşa sadık kalacak. Göz kırpma riski en çok yakın çekimlerde olduğu için 4. bölümdeki kurallar bu iki sahnede daha sıkı uygulanacak.

Işık açılıp kapanma gibi bütün ışık değişimleri Kling'de değil, montajda (ffmpeg) yapılacak. Böylece titreme olmaz.

## 3. Sahne sahne plan (~18 sn, dikey 9:16)

| # | Saniye | Kaynak | Çekim | Kamera ve ışık | Geçiş |
|---|---|---|---|---|---|
| 1 | 0–1,5 | Durağan kare + ffmpeg | Geniş, sabit, dikey | Önce ışıklar kapalı, çayır karanlık. Flaş sesiyle softbox'lar yanıyor, koltuk beliriyor. | Vuruşta sert kesme |
| 2 | 1,5–5 | Kling | Orta çekim, koltuk ortada ve sabit; kadrajda bir softbox'ın kenarı | Kamera koltuğun çevresinde 15–20° ağır bir yay çiziyor (Reels 2'deki `4-yay` gibi, yalnızca istemle). | Sert kesme |
| 3 | 5–7,5 | Kling | Kumaşa çok yakın çekim (koltuğun kolçak kıvrımı, ~100 mm hissi); kadrajda tüyler ve yapraklar var, kuş başı yok | Kamera kumaşın üstünde birkaç santim yavaşça kayıyor. Kling'de ışık sabit; yandan tarayan ışık parlaması montajda ekleniyor. | Vuruşta kesme |
| 4 | 7,5–10,5 | Kling | Çimen hizasından alçak açı; ön planda bulanık çimen yaprakları | Kolçağa doğru yavaşça yaklaşma ya da hafif yükselme. Kadrajda kuş başı olmayan bir yüzey olacak. | Sert kesme |
| 5 | 10,5–13 | Kling (başlangıç + bitiş karesi) | Elde kumaş, yakın | Bir el katlı kumaşı açıyor, kuyruk "açılıyor". Bitiş karesi kumaşın düz hâli, gerçek desen dosyasından yapılıyor; böylece desen açılınca gerçek Mayura'ya oturuyor. **En riskli sahne** (el + açılan desen). 2 denemede olmazsa yedeği: gerçek desenin üstünde ağır kaydırma, kuyruk yavaşça kadraja giriyor (montajda, ücretsiz). | Sert kesme |
| 6 | 13–16,5 | Kling | Yukarıdan geniş açı (mevcut karenin açısı) | Kamera yavaşça geri çekiliyor, iki softbox da görünüyor. Sonunda ışıklar montajda sönüyor. | Son vuruşta karartma |
| 7 | 16,5–18,5 | Montaj | Kapanış kartı | Karanlıkta logo beliriyor (Reels 2'deki kart). | — |

**Videoda yazı olmayacak.** "Siparişle üretilir · 3 ay" gibi bilgiler gönderi açıklamasına yazılacak, Instagram'ın kendi "AI info" etiketi kullanılacak.

### Kling istemleri (İngilizce gidecek, taslak)

- **Hepsinde:** "Constant studio lighting from two softboxes. Printed static velvet upholstery, the pattern is ink fixed to the cloth and does not move. Still evening air, grass barely moving."
- **2:** "Camera slowly arcs 15 degrees around the armchair, the chair stays centred and fixed."
- **4:** "Low angle at grass height, out-of-focus grass blades in the foreground, camera slowly pushes in toward the armrest."
- **3:** "Extreme close-up macro of printed velvet upholstery on a curved armrest. The camera glides a few centimetres sideways, shallow depth of field, velvet pile catching the light. Constant lighting."
- **5:** "Close-up. A hand slowly unfolds a folded piece of printed velvet and smooths it flat. The print is ink fixed to the cloth and only moves with the fabric." (Bitiş karesi: düz kumaş, gerçek desen.)
- **6:** "High angle, camera slowly pulls back revealing both softboxes on stands in the meadow."
- **İstenmeyenler:** "morphing pattern, pattern sliding, warping, flicker, light changes, flowers appearing, text, people". Kuş, göz, hayvan kelimeleri hiç kullanılmayacak.

## 4. Hataya karşı kurallar

- **Gözler:** Tavus kuşu başları küçük kalacak ve karenin en net yeri olmayacak. Yakın çekimlerde (3. ve 5. sahne) kadraja kuş başı alınmayacak; yalnızca tüyler, yapraklar ve kuyruk görünecek. Ana karede baş görünüyorsa kadraj değiştirilecek, istem değil.
- **Klibin yalnızca ilk ~3,5 saniyesi kullanılacak.** Reels 2'de bulanık göz 3,5 saniyeden sonra belirmişti.
- **Kontrol:** Her klip saniyede 4 kare tabloyla incelenecek. Görünen her kuş başı saniyede 12 kare ve büyütülerek kontrol edilecek. Arka plan hareketi sabit noktalardan (softbox ayağı, ufuk çizgisi) izlenecek: koltuk mu dönüyor, kamera mı?
- **Desen kayması:** Yay küçük tutulacak, kamera koltuğun arkasına hiç dolanmayacak. Arkayı model kendisi uydurmak zorunda kalır.
- **Çimen:** Hafif kıpırtı gerçeklik katar. Çiçeklerin belirip kaybolmasına dikkat edilecek.
- **Koltuk biçimi:** Bütün açılar tek bir onaylı dikey ana kareden türetilecek. Her kesmede koltuğun silueti karşılaştırılacak.
- **Tekrar:** Sahne başına en fazla 2 deneme. Yine olmazsa durağan kareye ffmpeg ile katmanlı derinlik (2.5D) hareketi verilecek. Bu yöntemde hiçbir şey canlanamaz.

## 5. Müzik ve tempo

Gece hissi veren, dakikada 80–90 vuruşluk sade bir parça: seyrek çekilen teller ve altta cırcır böceği sesi. İlk vuruşta flaş sesi ve ışıklar yanıyor. Kesmeler vuruşlara düşüyor. Son vuruşta ışıklar sönüyor.

## 6. Reels 2'den farklı yapılacaklar

- **Önce yalnızca bir ana kare.** Daha aydınlık, desen gerçek Mayura'ya sadık, dikey bir ana kare üretilecek. Sen onaylamadan videoya geçilmeyecek.
- **Tek deneme klibi.** Önce yalnızca 2. sahne üretilecek. İyi çıkarsa diğerlerine geçilecek.
- **Telefon çekimi yok, 5 Kling klibi var.** Yakın çekimlerin deseni gerçek kumaş dosyasından geliyor; 5. sahnede bitiş karesi doğrudan gerçek desen.
- **Bütün ışık efektleri montajda yapılacak.**

## 7. Üretim sırası ve bütçe (tahmini)

| Aşama | Ne | Tahmin |
|---|---|---|
| 1 | **Dikey ana kare.** Nano Banana Pro Edit; referanslar: mevcut kare (koltuk biçimi ve sahne), 3×3 Mayura. Hedefler: daha aydınlık mavi saat, softbox'lar koltuğu gerçekten aydınlatıyor, soğuk bir kenar ışığı siyah zemini geceden ayırıyor. ~3 deneme. | ~0,45 $ |
| 2 | Aynı karenin "ışıklar kapalı" hâli (1. sahne için) | ~0,15–0,30 $ |
| 3 | 3., 4., 5. ve 6. sahnelerin ana kareleri (onaylı ana kare + `mayura-hd.jpg`); 5. sahnenin bitiş karesi dahil, kare başına ~2 deneme | ~1,20–1,50 $ |
| 4 | Deneme klibi: 2. sahne, 5 sn | ~0,70 $ |
| 5 | Kalan 4 klip × en fazla 2 deneme | ~5,60 $ |
| — | Montaj (ffmpeg) | 0 $ |
| | **Toplam** | **~8–9 $, üst sınır 14 $** |

Fiyatlar Reels 2'deki birim fiyatlardan hesaplandı. Her aşamadan önce güncel fiyat kontrol edilip sana sorulacak.

## 8. Telefon çekimi

Yok. Kullanıcı 17.11.2026'da bütün sahnelerin Kling ile üretilmesini seçti. İleride gerçek kumaş elde edilirse 3. ve 5. sahneler telefon çekimiyle değiştirilebilir; en inandırıcı yol hâlâ bu.

## Durum

**17.11.2026 · 1. aşama: dikey ana kare (3 deneme, ~0,45 $)**
- Model `fal-ai/nano-banana-pro/edit`, 2K, 9:16 (1536×2752). Referanslar: `referans/cayir-tavus.png` + `referans/mayura-1x.jpg` (A) ya da `referans/mayura-2x2.jpg` (B, C).
- `ana-a-1x.png`: üstten, koltuk büyük. `ana-b-2x2.png`: önden, iki softbox koltuğu çerçeveliyor. `ana-c-2x2-ucdortte.png`: dörtte üç açı.
- Karşılaştırma: `kontrol/ana-karsilastirma.jpg`, desen yakın: `kontrol/ana-desen-yakin.jpg`.
- Desen üçünde de gerçek Mayura'ya çok daha yakın (taç, kanat pulları, bronz sırt, tüy gözleri) ve gerçek ölçekte. Tavus kuşu başları sırtın sağında, kare yüksekliğinin ~%3'ü.
- Zayıf yan: koltuk softbox'ların parlaklığına göre hâlâ biraz karanlık.
- **Kullanıcı B'yi seçti → `ana-kare.png`** (B'nin kopyası). Bütün sahneler bundan türetilecek.
- Ücretsiz aydınlatma denemesi (`kontrol/aydinlatma-karsilastirma.jpg`): 1. ayar `curves=all='0/0 0.12/0.15 0.35/0.46 0.7/0.8 1/1'` koltuğu ~%20 aydınlatıyor ve gece hissini koruyor. 2. ayar gökyüzünü gündüze çeviriyor. 1. ayar Reels 2'deki gibi en sonda bütün videoya uygulanacak; Kling'e ana kare olduğu gibi gidecek.

**17.11.2026 · 2. sahne deneme klibi `klipler/2-yay.mp4` (~0,70 $)**
- Kling 3.0 Pro, başlangıç = ana kare (fal URL'si), bitiş karesi yok, 5 sn, cfg 0,7, ses kapalı. İstem: kavisli rayda ~15° sağa yay, koltuk ortada ve aynı boyda, kendi kendine dönmüyor, softbox ve ağaçlar perspektifle kayıyor. Çıktı 1072×1928, 24 kare/sn, 121 kare.
- Kontrol: `kontrol/2-yay-tablo.jpg` (4 kare/sn), `2-yay-ilk-son.jpg`, `2-yay-baslar-1/2.jpg` (kuş başları 12 kare/sn, aydınlatılmış), `2-yay-arka-plan.jpg`.
- Kuş başları 60 karenin hepsinde aynı; göz halkası ve gaga sabit, göz kırpma yok. Desen kumaşla birlikte dönüyor, kayma yok.
- Koltuk kadrajın ortasında kalıyor; görünüş açısı ~10–15° değişiyor (sol kolçağın dış yüzü açılıyor). Softbox'lar ve ağaç çizgisi ~70 px sağa kayıyor, softbox'lar biraz büyüyor (hafif yaklaşma da var). Yani kamera **sola** yay çiziyor (istem sağ diyordu). Ağaçlarla softbox'ların kayma farkı (derinlik farkı) zayıf; kullanıcı izleyip değerlendirmeli.
- Koltuk parlaklığı 44,1–45,7 arası (titreme yok). 0→1. karede sıçrama var (skor 0,87): montajda ilk 2 kare atılacak.

**17.11.2026 · Kalan kareler, klipler, müzik (~4,50 $). Kullanıcı ara onay istemedi ("hepsini uygun şekilde generate edip devam et").**
- Kareler (`kareler/`, 10 deneme): seçilenler `k1-kapali`, `k3-makro-a`, `k4-alcak-b`, `k5-katli` + `k5-acik-b`, `k6-yuksek-b`. Elenenler: `k4-alcak-a` (koltuk bozuk), `k5-acik-a` (kumaş açılmamış), `k6-yuksek-a` (kadraj ana kareyle aynı).
- Klipler (`klipler/`, Kling 3.0 Pro, 5 sn): `3-makro`, `4-alcak`, `5-acilan` (başlangıç + bitiş karesi), `6-yuksek`. Hepsinde 0→1. karede sıçrama var, ilk kareler atılıyor.
- `5-acilan`: 62–79. kareler arasında desen bozuluyor (kuyruk kuşlara dönüşüyor). Montajda vuruşa denk gelen bir sıçrama kesmesiyle atlandı. 80–119 temiz, kuş başları 12 kare/sn'de sabit.
- `6-yuksek`: parlaklık 47,8'den 63,4'e düzgünce artıyor (gökyüzü açılıyor, titreme yok). Son ~1,5 sn'de alttan bulanık çiçekler giriyor.
- Müzik `montaj/muzik.mp3` (ElevenLabs, 33,5 sn): 15,3 sn'de ilk vuruş, sonra ~2 sn'de bir.

**17.11.2026 · Montaj `montaj/cikti/reels-3.mp4` (yeniden üretmek için: `bash montaj/montaj.sh`)**
- 1080×1920, 24 kare/sn, 456 kare (19,0 sn), yuv420p, tv, bt709, AAC.
- Akış (kare): K1 ışıklar kapalı (koyulaştırılmış, 36) → yay, ilk 3 karede parlama (96) → makro (48) → alçak (48) → kumaş kaldırılıyor (5-acilan 14–61, 48) → sıçrama kesmesi → açılmış kumaş (80–119, 40) → yüksek çekiş (6-yuksek 16–119, 104) → 0,5 sn geçişle kart (48).
- Müzik 13,8 sn'den başlıyor: ilk vuruş tam 1,5 sn'de, ışıkların yandığı karede (ölçüldü). Kesmeler 5,5 / 7,5 / 9,5 / 11,5 / 17,0 sn'de, vuruşlarla aynı yerde; yalnız 13,2 sn'deki kesme vuruşa denk gelmiyor.
- Renk: 2–6. sahnelere 1. ayar eğrisi, bütün videoya hafif gren. Kart: koyu zemin, %20 Mayura şeridi (`montaj/kart/serit-mayura.png`), Reels 2'nin logosu. Yazı yok.
- Kontrol: `kontrol/final-tablo.jpg` (4 kare/sn), `kontrol/final-kesmeler.jpg` (kesmelerin ±2 karesi).
- Toplam harcama ~5,65 $ (tahmini).

## 9. Açık sorular

1. Softbox'lar görünsün mü? Fable da ben de görünmelerini öneriyoruz, fikrin özü bu.
2. 1. aşamaya (dikey ana kare, ~0,45 $) başlayayım mı?
