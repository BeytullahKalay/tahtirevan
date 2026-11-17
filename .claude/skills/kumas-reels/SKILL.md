---
name: kumas-reels
description: Tahtırevan'da yeni bir kumaş için baştan sona Reels üretim hattı (Higgsfield + ffmpeg). Kullanıcı yeni bir kumaş görseli verip "bunun için çekim/reels/reklam yapalım", "yeni kumaş", "reels-N", "koltuk bul, ortam bul, kareleri çek, video yap, montajla" dediğinde ya da süren bir reels-N klasörünün (D:\tahtirevan\pazarlama-video\reels-N) sıradaki aşamasına geçmek istediğinde kullan. Koltuk tasarımı, kumaş giydirme, ortam, storyboard kareleri, Seedance klipleri, montaj ve teslim aşamalarını, Claude sohbeti için görev dosyalarını ve Reels 1-3'te yaşanmış hataları kapsar.
---

# Kumaş Reels hattı

Kullanıcı her yeni kumaşta yalnızca **kumaş görselini** (ve varsa adını, rapor ölçüsünü) verir. Gerisini bu dosya taşır; açıklamayı yeniden istemezsin.

Bu klasördeki dosyalar: `sablonlar.md` (istem, görev dosyası, montaj betiği kalıpları), `kompozisyon.md` (reklam sekansları, çekim kütüphanesi, 9:16 kuralları, kaynaklar), `isik.md` (34 ışık stili, hangisi ne zaman, kumaş tipine ve çekime göre ışık seti, ölçü kontrolü), `cekim.md` (34 çekim türü, hangileri kullanılır, çekim boyu basamağı).

Önce yükle: `higgsfield-expert` (istem yazımı, model seçimi). Montaj aşamasında: `reels-montaj` (ffmpeg tuzakları, renk). Referans iş: `D:\tahtirevan\pazarlama-video\reels-3\` (`higgsfield/plan.md` durum günlüğü, `montaj/montaj-v9.sh` son montaj, örnek çıktı `montaj/cikti/reels-3-v9.mp4`).

## 0 · Başlangıç (her yeni kumaşta)

1. Sıradaki numarayı bul: `ls D:/tahtirevan/pazarlama-video` → en büyük `reels-N` + 1.
2. Klasörü aç:
   ```
   reels-N/
     plan.md          kumaş künyesi + aşama tablosu + "Durum" günlüğü (her işte güncelle)
     referans/        <kumas>-1x.jpg (gelen görsel), <kumas>-3x3.jpg (döşenmiş)
     1-koltuk/  2-kumas/  3-ortam/  4-kareler/  5-klipler/
     6-montaj/        montaj.sh, ara/, kart/, cikti/
     kontrol/         kare tabloları, karşılaştırmalar
     gorevler/        Claude sohbetine yapıştırılacak görev dosyaları
   ```
3. Kumaşı tanı: `site/public/fabrics/*.jpg` ile karşılaştır (aynı desen sitede hangi adla?). Ad yoksa kullanıcıya sor.
4. **Referansın kaç rapor olacağı koltuğa göre seçilir**: yan yana rapor sayısı ≈ koltuk eni / rapor. Model referanstaki sıklığı kopyalar: Mayura (30 cm rapor, 82 cm sırt) 3×3 ile doğru küçüldü; Soraya (70 cm rapor, 90 cm koltuk) 3×3 ile ~2,5 kat küçük ve sık çıktı; tek raporla (1x) ölçek ve motif sadakati düzeldi (Reels 4, 8/8 görselde) → **iri raporda tek rapor (1x) ver**. İstemde "image N shows exactly one repeat, X cm wide... copy the print exactly as drawn, never a smaller or denser version" yaz ve motifin koltuktaki cm boyunu söyle. Döşenmiş referans (küçük raporlar için):
   ```bash
   ffmpeg -i referans/X-1x.jpg -vf "scale=800:-2:flags=lanczos,split=3[a][b][c];[a][b][c]hstack=3,split=3[x][y][z];[x][y][z]vstack=3" -q:v 2 referans/X-3x3.jpg
   ```
   Küçültüp bak; dikiş yerleri kabaysa yine de kullanılabilir.
5. **Kumaş raporunu ve enini kullanıcıya SOR** (ilk mesajda, başka hiçbir şeyden önce; tahmin etme). Sade örnekle sor: "Rapor = desenin kendini tekrar ettiği boy, ör. Mayura'da en 145 cm, rapor 30 cm. Soraya'da en ve rapor kaç cm?" Cevap gelmeden koltuk üretimine geçme: koltuk modelleri kumaşın ölçüsüne göre seçiliyor (1. aşama). Ölçek hesabı tamamen buna dayanır: gelen 1x görsel = 1 rapor, 3×3 referans = 3 × rapor cm genişlik.
   Kumaş künyesi (`plan.md` başı): ad, zemin rengi, ana motif, renkler, **baskılı kadife mi**, en, rapor. Bilinen kumaşlar: Mayura en 145 / rapor 30 cm; Soraya en 145 / rapor 70 cm. Motifte göz/yüz/hayvan varsa (tavus, leopar) göz kırpma kuralları geçerli (aşağıda).
6. Kredi: `balance`. Kip seçimi aşağıda.

## İki çalışma kipi (önemli)

Higgsfield Ultra deneme/abonelikteki **sınırsız (unlim) hak Claude Code MCP'sinde kullanılamıyor** (`models_explore unlim.available:false`). Sınırsız hak yalnız claude.ai sohbeti / Cowork / ChatGPT'deki Higgsfield bağlantısında çalışır. Bu yüzden:

- **Burada (Claude Code, kredi):** ucuz işler. Soul 2.0 kare başına 0,12 kredi (tasarım taslakları için ideal). Nano Banana Pro 2 kredi, Nano Banana 2.1 1,5, Seedream 5 Pro 2,5. Video: Seedance 2.5 / Kling 3.0 std 5 sn ≈ 7,5–15 kredi. Her üretimden önce `get_cost`, kullanıcıya bir satırla söyle; kredi yetmiyorsa ikinci kipe geç.
- **Claude sohbeti (sınırsız):** NB Pro kareleri ve bütün videolar. `gorevler/gorev-<aşama>.md` yaz (şablon: `sablonlar.md` → "Görev dosyası"), kullanıcı claude.ai'de yeni sohbete yapıştırır. Sohbet bitince job id'leri buraya yapıştırır; sonuçları `jobs_wait` (job_id ile) → `result` URL'si → `curl -L -o` ile ilgili klasöre indir.
  - Görev dosyasında: her işte `use_unlim: true`, "sınırsız reddedilirse dur, kredi harcama", istemler **kelimesi kelimesine**, bağımlı işler (bir önceki işin çıktısı start_image ise) ayrı sırada, sonunda "her işin numarası, job id'si, sonuç bağlantısı" listesi.
  - Referans görseller job id ya da media id ile verilir; yeni yerel dosya gerekiyorsa önce burada `media_upload` + `curl PUT` + `media_confirm` yap, media id'yi görev dosyasına yaz (yükleme kredi harcamaz). PUT'ta imzalı başlıklarda `if-none-match` var: `curl -X PUT -H "Content-Type: image/jpeg" -H "If-None-Match: *" --data-binary @dosya "<upload_url>"` (200 dönmeli).
  - Kullanıcı "bitti" deyip job id vermezse: `show_generations` (salt okur Higgsfield bağlantısı ya da `mcp__higgsfield__show_generations` + `only_completed:false`) ile son işleri bul, istemlerinden hangi işe ait olduklarını eşle. Görev dosyası sonradan değiştiyse kullanıcı eski hâlini çalıştırmış olabilir: iş sayısını say, eksikse söyle.
  - Görev dosyası yazınca dosyanın tam yolunu ve "claude.ai'de yeni sohbet aç, içeriği yapıştır, bitince job id listesini buraya yapıştır" talimatını ver.

## Aşamalar (her aşamanın sonunda kullanıcı seçer; seçilen "kilitlenir")

| # | Aşama | Çıktı | Model / kip |
|---|---|---|---|
| 1 | **Kumaştan koltuk**: kumaşı oku → tasarım şartları → kumaşa göre 6 koltuk, **kumaş üstünde** üretilir | `1-koltuk/kumas-okumasi.md`, `1-koltuk/m1..m6-*.png` | NB Pro + 3×3 kumaş referansı (Claude sohbeti, sınırsız). Kredi/sohbet yoksa Soul 2.0 düz kadife yedeği |
| 2 | **Kumaş düzeltme**: seçilen modelde ölçek ve dikiş kontrolü; gerekirse kilitli biçim + 3×3 ile yeniden giydirme | `2-kumas/a,b.png` | NB Pro edit, 2 deneme (seçilen model ölçek/dikiş testini geçerse atlanır) |
| 3 | **Ortam**: kumaşı öne çıkaran 3–4 ortam fikri, kullanıcı seçer, sonra ana sahne karesi | `3-ortam/fikirler.md`, `3-ortam/sahne-a,b.png` | NB Pro edit (koltuk + kumaş referansı) |
| 4 | **Storyboard**: 6–7 çekimlik plan (tablo + tutma şansı), onaydan sonra her çekimin ilk karesi | `4-kareler/plan.md`, `4-kareler/c1..c7.png` | NB Pro, hepsi ana sahneden türetilir |
| 5 | **Klipler**: her çekim 5 sn, 9:16, 720p, sessiz, ilk kare = 4. aşama karesi | `5-klipler/c1..c7.mp4` | Seedance 2.5 (`omni_reference`, start_image) |
| 6 | **Montaj**: ~15–17 sn, hareket ortasında kesme, kart, müzik, gren | `6-montaj/cikti/reels-N-v1.mp4` | ffmpeg, `reels-montaj` skill'i |
| 7 | **Teslim**: kalite kontrol tablosu, Instagram açıklama taslağı | `kontrol/`, `plan.md` | — |

1, 2 ve 3'te dur ve seçtir (en çok 3 soru, öneri ilk seçenek). **4. aşamanın taslağı (storyboard) her zaman onay ister: taslak onaylanmadan kare ya da klip üretimine geçme**, kullanıcı başka aşamalarda "ara onay istemiyorum" demiş olsa bile (kullanıcı kuralı, 18.11.2026). Onaysız ilerlenen aşamalarda her seçimi `plan.md`'ye gerekçesiyle yaz.

### 1 · Kumaştan koltuk (koltuk kumaşa göre seçilir, tersi değil)

Kullanıcının istediği: **koltuk modelleri kumaşa bakılarak getirilir.** Marka dilinden ya da "tahtırevan" kelimesinden yola çıkan taslaklar Reels 4'te iki tur reddedildi; kumaşı okuyup gerekçelendirilen yalın modern koltuk (3. tur) kabul edildi.

**a · Kumaş okuması** (`1-koltuk/kumas-okumasi.md`, üretimden önce yaz ve kullanıcıya kısa özetini ver). Kumaş görseline bak ve her maddeden bir tasarım şartı çıkar:

| Kumaşta bak | Koltuğa çıkan şart (örnek: Soraya) |
|---|---|
| **Rapor ve motif boyu** (cm) | Ana motif bölünmeden görünmeli → sırt eni ≥ rapor + pay. Soraya 70 cm rapor → ~90 cm geniş koltuk; dar sırtlı koltuk (≤60 cm) motifi keser |
| **Motif yönü** (dikey damla, yatay sürü, dağınık) | Dikey uzun motif → yüksek sırt ya da uzun dikey panel; yatay sürü → geniş alçak sırt, kanepe |
| **Yoğunluk** (kalabalık / seyrek) | Kalabalık desen → çok yalın gövde (zıtlık sofistike görünür); seyrek/grafik → biçim daha karakterli olabilir |
| **Üslup** (geleneksel, botanik, grafik, figürlü) | Geleneksel desen + yalın modern biçim = taze; geleneksel + oymalı klasik = "ağır, eski usul" |
| **Zemin rengi** | Ayak/taban zemin rengine karışsın (siyah zemin → görünmez siyah taban); ahşap/metal ikinci bir dikkat odağı olmasın |
| **İkincil renkler** | Biye ya da küçük detay bunlardan biri olabilir; yoksa kumaşın kendisi |
| **Doku** (kadife, keten, jakar) | Kadife kıvrımda parlar → yuvarlak kenarlar; düz dokuma → keskin hatlar da olur |
| **Figür/göz var mı** | Varsa figür sırtın ortasına gelir, yakın çekimde kadraja girmez |
| **Video** | Sade, tek parça gövde AI'da bozulmadan kalır; ince ayak, oyma, çubuk titrer |
| **Üretilebilirlik** | Döşemecinin yapabileceği gerçek biçim: paneller, ayrı minder, biye; kumaş eni (145 cm) büyük kıvrımlı sırtta dikiş gerektirir → dikiş arkanın ortasında, motif simetrik |

**b · 6 model**: şartlardan çıkan 6 farklı yön, her birinin yanında "bu kumaş için neden" cümlesi. Hepsi şartları karşılar, birbirinden biçimce belirgin farklıdır (ör. geniş alçak kabuk, yüksek sırtlı modern kanat, kolsuz geniş slipper, derin club, şezlong, yüksek sırtlı yuvarlak döner). Kumaş okumasında elenen yönleri de bir satırla yaz (neden yok).

**c · Kumaş üstünde üret**: NB Pro, `image_references` = 3×3 kumaş (media id), istem `sablonlar.md` → "1 · Kumaştan koltuk". Kullanıcı modeli kumaşla birlikte görüp seçer; düz kadife taslakla karar vermek zordu. Sınırsız hak için Claude sohbeti görev dosyası. Sohbet kullanılamıyorsa ve kredi azsa: Soul 2.0 ile düz kadife taslak (`sablonlar.md` → "1b · Düz kadife yedeği"), seçilene 2. aşamada kumaş giydirilir.

**d · Göster**: 6'sını numaralı tabloya koy (`kontrol/1-koltuk-tablo.jpg`), her birine bir satır: desen nasıl okunuyor (motif bölünmüş mü, ölçek doğru mu), üretilebilir mi, videoda tutar mı + bir öneri. Seçilen model ölçek ve dikiş testini geçiyorsa doğrudan kilitlenir; geçmiyorsa 2. aşamada düzeltilir.

Marka notları (ikincil, yalnız kullanıcı isterse): sitedeki parçalar `site/data/tahtirevan.db` (`pieces`, `pieces_locales`), el oyması ceviz gövde, kumaş sırta tek parça. Kafes, başlık, sivri tepe gibi kelimesi kelimesine "tahtırevan" yorumları reddedildi. Işık ve fon: sıcak açık gri sıva duvar, açık taş zemin, yandan pencere ışığı; düz gri müze fonu soğuk durdu. Bir video içinde tek tasarım.

### 2 · Kumaş giydirme
- Görsel 1 = kilitli koltuk, görsel 2 = 3×3 kumaş. "Görsel 1'i aynen tut, yalnız kumaşı değiştir" kalıbı.
- Ölçek hesabını yaz: koltuk sırtı X cm, 3×3 referans 3 × rapor cm → sırtta kaç rapor görünmeli. Her sonucu bu oranla kontrol et.
- Baskılı kadife: "crisp printed picture, flat soft velvet pile, no raised threads, no 3D stitching". Desen her panelde ayrı kesilir, dikişte durur.

### 3 · Ortam
- 3–4 fikir öner, her biri tek cümle + neden kumaşı öne çıkarır (zemin rengiyle kontrast, kumaştaki ikincil renklerin ortamda tekrarı, ortamın doygunluğu düşük olmalı ki **kumaş karedeki tek doygun şey** olsun).
- **Işığı `isik.md`'den seç** (§0 ilke, §2 kumaş tipine göre set). Ölçü: ışık kumaşın önüne geçmez, kumaş da spota konup itilmez; "önce oda ve an, sonra kumaş".
- Fiziksel ışık mantığı: her ışığın kaynağı kadrajda ya da adlandırılmış; koltuk ışığın içinde ama kendinden parlamaz, hale ve sert kenarlı spot yok; yerle temas gölgesi; ışık arkadan geliyorsa ön karanlık kalır.
- Kaçın: tepeden tanrı ışığı + karanlık boş oda, peri tozu çim, kobalt gök, düz parlak "render" zemin.

### 4 · Storyboard (onay kapısı)
- **Önce `kompozisyon.md`'yi oku**: Reels iskeleti (kanca ≤1,5 sn), 9:16 güvenli alan ve çerçeve kuralları, kumaş ışığı, çekim kütüphanesi (A1–A18, tutma şanslarıyla; türlerin tamamı ve basamak kuralı `cekim.md`), sekans şablonları (S1 karanlıktan ışığa, S2 kumaştan koltuğa, S3 sessiz oda), kurgu ritmi, Seedance yazım kuralları.
- Kumaşa göre şablon seç, çekimleri kütüphane kodlarıyla diz, `kompozisyon.md` §8 tablosuyla sun (kompozisyon + kamera + neden + şans), toplam iş sayısını ve kipi yaz. Tabloda her çekimin ışığını da yaz (`isik.md` §3 reçetesi; Reels'te en fazla 2 ışık olayı) ve sunmadan önce `isik.md` §5 ölçü kontrolünü ve `cekim.md` §3 basamak kuralını (en fazla 1 geniş, 1–2 makro, ardışık çekimde boy ya da ≥30° açı değişir) uygula. **Onay gelene kadar dur.**
- Reels 3 v9 akışı (S1) iyi çalıştı: açılış (ışık/karanlıktan çıkış) → engelin arkasından açılma → yakın kayma (kol kıvrımı) → küçük yay (≤15°) → alçak ilerleme → yükselip uzaklaşan kapanış → kart.
- Bütün kareler **tek onaylı sahne karesinden** türetilir; her yeni açı isteminde "the print keeps exactly the same size as in image 2" ve ölçek cümlesi.
- Yakın çekim karesi desen ölçeğini büyütmeye meyilli: `4-aci-yakin` 2× büyüdü; kumaşlı stüdyo karesini ölçek referansı olarak ekle.
- **Açıyı derece değil, kadrajda ne görüneceğiyle yaz** (Reels 4): "45° aşağı" yazılan üstten kare göz hizasına döndü. Tutan istem: kamera yüksekliği + "minder neredeyse tepeden, sırt kısalarak geriye yatar, kollar at nalı gibi sarar, zemin etrafta görünür, duvardan yalnız ince şerit, pencere/tavan yok" (2'de 2 tuttu).
- Üstten karede minder desenini ayrıca yaz ("the seat cushion is upholstered in the same print"); yazılmayınca 2'de 1 minder düz siyah kadife çıktı ve gövde fıçı koltuğa döndü.
- Reels 4 akışı (S4 koltuktan kumaşa, `kompozisyon.md` §5) onaylandı: pervazdan açılma → hero yaklaşma → alçak kol → üstten → makro + geçen ışık → düz kumaş (eşleşen kesme) → geniş kapanış → kart.

### 5 · Klipler (Seedance 2.5)
- Ayar: `seedance_2_5`, `omni_reference`, 9:16, 720p, 5 sn, `generate_audio: false`, `medias: [{role: start_image, value: <kare job id>}]`.
- İstem kalıbı `sablonlar.md` → "5 · Klip". Her klipte: tek kamera hareketi + metre/derece cinsinden miktar, "only the camera moves", "the print is ink on cloth that stays exactly as in the first frame", hafif esinti (çim/perde varsa), "the light in the sky stays the same", "everything at real speed".
- Önce 1 deneme klibi, iyi çıkarsa kalanlar (kullanıcı tümünü istemişse hepsi birlikte).
- **Henüz gönderilmeyecek görevi `gorevler/` içinde bırakma**; `gorevler/taslak/` altına koy. Reels 4'te kullanıcı deneme yerine klasördeki taslak 5'li görevi yapıştırdı (iş sayısını geçmişten say, hangi klibin hangi çekim olduğunu ilk karelerinden ayır).
- Geçen ışık (passing light) makroda tuttu (Reels 4, 1'de 1): "The camera does not move. A soft band of warm sunlight ... slides across ... over four seconds ... then the fabric settles back into soft shade." Başlangıç karesi gölgede olmalı. Ölçüm: kadrajın üçte birlerinde `signalstats` YAVG zamanla tepe yapar.
- Gelen her klibi: 4 kare/sn tablo, ilk-son kare SSIM (koltuk ve arka plan bölgesi), sıçrama taraması (`scdet`), desen değişimi. Kamera mı koltuk mu dönüyor, sabit noktalarla yaz.

### 6 · Montaj
- `sablonlar.md` → "6 · Montaj betiği" (`reels-3/montaj/montaj-v9.sh`'nin genelleştirilmişi). Klipten kesit: ilk ~1 sn'yi at (0→1 sıçraması), hareketin ortasında kes, 48–72 kare.
- Kart: koyu zemin + **yeni kumaştan** %20 şerit + amblem ve yazı (`reels-3/montaj/kart/`, `reels-2/montaj/kart/logo-kart.html`). Eski kumaşın kartını kullanma.
- Müzik: `reels-3/montaj/muzik.mp3` geçici; kullanıcı yeni parça vermezse onu kullan ve söyle. Kesmeleri vuruşa oturt (vuruşları ölç).
- Renk: kumaşa dokunma; yalnız uyumsuz klibi öbürlerine yaklaştır (`colorlevels`). Gren `noise=c0s=5`.
- **Düz kumaş karesi (eşleşen kesme) tek rapor görselinin içinden kırpılır.** Raporu 2×2 döşeyip kırpınca rapor kenarında yatay iz kaldı (Reels 4 v1 ilk deneme). Motifin makronun son karesindeki konumunu ölç, kırpımı ona göre seç.
- Farklı en-boy oranından ölçeklenen girişler `concat`'i bozar (SAR 728:729): `GEOM`'a ve durağan görsellere `setsar=1`.
- Kart: `reels-4/6-montaj/kart/kart.html` (amblem + TAHTIREVAN + kumaş adı), `emblem.svg`'yi kart klasörüne kopyala (site yolu `C:\Users\Beytullah KALAY\OneDrive\Desktop\tahtirevan\site\public\brand\`). Edge açıkken başsız çekim sessizce başarısız olur: `--user-data-dir=<scratchpad>\edge` ekle.
- Videoda yazı yok. Açıklamaya: "Tasarım önizlemesi · kumaş gerçektir, koltuk siparişle üretilir · ~3 ay". Instagram'da "AI info" etiketi açılır; dosya metadata'sını silme.

### 7 · Teslim
- Final tablosu (`kontrol/final-tablo.jpg`), kesme karesi ±2 tablosu, `ffprobe` ile 1080×1920, 24 fps, yuv420p, tv, bt709.
- Kullanıcıya `SendUserFile` ile video + tablo. `plan.md` Durum'a sürüm, süre, harcama.

## Sabit kurallar (Reels 1–4'te yaşandı)

- **Bir videoda tek koltuk tasarımı.** Bütün açılar tek kilitli kareden.
- **Desen ölçeği referansla tutar**, istem cümlesiyle değil (3×3). Gelen her karede rapor sayısını say.
- **Kumaş baskıysa kabarık işleme gibi görünmemeli**; müşteri desene bakıp sipariş veriyor.
- **Gerçek döşeme gibi**: paneller, biye, ayrı minder, gerginlik kırışığı, yer teması. "Şişme minder" görünümü = yapay.
- **İstemde yasak listesi yerine olumlu tarif**; bird/eye/animal/face kelimeleri yazılmaz (motif hayvanlıysa).
- **Göz/yüz motifi varsa**: yakın çekimde kadraja alınmaz, klibin ilk ~3,5 sn'si kullanılır, 12 kare/sn büyütülerek kontrol edilir.
- **Koltuğun arkasına dolanan kamera yok**; yay ≤15°. Görmediği yüzü uydurur.
- **Işık değişimi (ışık yanma) klipte riskli**: Reels 3'te 1,5 sn istendi, 3,9 sn'de tek karede yandı ve koltuk yeniden çizildi. Ya kesmeyle çöz ya ışığı montajda yap.
- **Kamera hareketli kliplerde donmuş-koltuk maskesi kullanılmaz** (kayar). Yalnız sabit tripod kliplerde.
- **ffmpeg ile rüzgâr/çim bükme yok** (kullanıcı reddetti). Esinti üretimden gelir.
- Fazla pürüzsüz kamera, gökyüzünün ışıkla aydınlanması, el/kumaş açılırken desen değişimi = "çok yapay" geri bildirimi aldı.
- Kart sade: amblem + yazı, flaş yok. Videoda yazı yok.
- Kullanıcı Türkçe ve sade dil ister; teknik terimi örnekle açıkla. Her üretimin maliyetini önceden bir satırla söyle.

## Durum günlüğü biçimi (`plan.md` sonu)

```
- GG.AA.YYYY · <aşama>: ne üretildi (dosya ← job id), maliyet, gözlem (iyi / zayıf), öneri.
- GG.AA.YYYY · **Kilitlendi: <dosya>** (kullanıcı seçti, kabul edilen kusurlar).
```
Yeni oturum bu günlükten devam eder: "reels-N'e devam" denince önce `plan.md`'yi oku, sıradaki aşamayı söyle.
