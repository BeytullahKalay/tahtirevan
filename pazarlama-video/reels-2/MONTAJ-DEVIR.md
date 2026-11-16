# Reels 2 · Montaj devir talimatı

> **Bu dosyayı alan Claude oturumu için:** Bu, Tahtırevan'ın 2. Instagram Reels videosunun montaj talimatıdır. Yapay zekâ klipleri üretildi ve kullanıcı hepsini onayladı. Senin işin bu klipleri ve kullanıcının telefonla çekeceği gerçek kumaş görüntülerini aşağıdaki plana göre tek bir dikey videoda birleştirmek. Dosyayı okuduktan sonra soru sormadan **"Başlamadan önce"** bölümünden başla. Yalnızca bu dosyada "kullanıcıya sor" yazan yerlerde dur.

---

## 1. Bağlam (kısa)

- **Marka:** Tahtırevan, siparişle üretilen döşemeli koltuklar. Proje klasörü: `C:\Users\Beytullah KALAY\OneDrive\Desktop\tahtirevan`
- **Ürün:** Kıvrımlı ceviz yan ayaklı, oval sırtlı tek kişilik koltuk. Kumaşı gerçek **"Panthera"** kadifesi: koyu kiraz kırmızısı zemin, İran tarzı süsleme, krem ve siyah leopar başları.
- **Görünüm:** Nötr, serin gri bir oda ve yumuşak pencere ışığı. Ekrandaki tek doygun renk kumaş.
- **Kullanıcı** Türkçe yazıyor ve teknik değil. Açıklamaları sade tut, kavramı örnekle anlat, teknik terim yığma.

### Değişmez kurallar

1. **Videoya hiçbir yazı/uyarı koyma.** "Tasarım önizlemesi", "Gerçek kumaş · Panthera", "AI" gibi bindirmeler **olmayacak**. Kullanıcının isteği: *"video gerçek gibi duruyor öyle kalmalı"*. `sinematografi-plani.md` içindeki yazı bindirmesi maddeleri artık geçersiz.
2. Kullanıcıya göstermeden "son hâl" deme. Her ara çıktıyı (kare tablosu ya da video) göster ve onay al.
3. Ücretli bir işi (fal.ai vb.) onaysız başlatma. Montaj için ücretli bir şeye gerek yok, her şey yerelde yapılıyor.
4. Git commit atma. API anahtarı ya da şifreyi hiçbir dosyaya yazma. Kullanıcının e-posta adresini hiçbir dış servise gönderme.
5. `site/` klasörüne dokunma; oradan yalnızca dosya oku (logo, kumaş görseli).
6. Yeni bir yapay zekâ klibi üretme. Klip yetersiz kalırsa bunu kullanıcıya söyle ve yeniden üretim için ayrıca onay iste.

---

## 1b. Daha önce yapılan hatalar ve dikkat edilecekler

Bunlar bu projede gerçekten yaşandı. Aynısını tekrarlama.

### Kontrol ve dürüstlük

- **Gördüğünü yanlış okuma riski yüksek.** 4. sahnenin ilk denemesinde "kamera koltuğun etrafında dönüyor" dendi. Oysa koltuk kendi etrafında dönüyor ve kayıyordu, kamera dönmüyordu. Bunu kullanıcı yakaladı, iki kez arka plan hareketi yanlış yorumlandı.
  - Hareketi anlatmadan önce sabit referans noktalarını kare kare izle: duvar köşesi, pencere kenarı, zemin çizgisi, vazo.
  - "Koltuk mu hareket ediyor, oda mı?" sorusunu açıkça cevapla.
- **Ana kareye bakıp klip hakkında hüküm verme.** `s3-c.png` için "göz yok" dendi, ama klipte 3,5 sn'den sonra bulanık bir göz belirdi.
  - Hükmü her zaman üretilmiş videonun karelerine bakarak ver.
  - Desen için 4 kare/sn'lik tablo yeterli. Leopar yüzleri ve gözler için 12 kare/sn'de büyüterek bak.
- **Tutarlılık:** Bir nesne (vazo, yastık, sehpa) bir planda olup diğerinde olmamalı, ya da plan içinde belirip kaybolmamalı. Sahneler arası her kesmede kontrol et.
- **Hata yaptıysan açıkça söyle.** Kullanıcı bunu bekliyor. Bir sorun kullanıcının model ya da yöntem seçiminden kaynaklandıysa bunu da açıkça belirt.
- **Kullanıcıya göstermeden "oldu" deme.** Önce kare tablosu ya da video, sonra onay.

### Görünüm (kullanıcının reddettikleri)

- **Reels 1 reddedildi.** Nedenleri: leopar göz kırptı; kumaş baskılı desen gibi değil, düz bir doku gibi okundu; çekimler düz ve sıkıcıydı.
- **Karanlık "boşluk oda" ve tepeden düşen ışık huzmesi** bariz yapay zekâ gibi görünüyordu, reddedildi. Doğru görünüm: nötr serin gri oda, yumuşak pencere ışığı, tek doygun renk kumaş.
- **Bütün videoya solgun, mat "film" rengi** kumaşı gizlediği için reddedildi. Renk ayarı kumaşı öne çıkarmalı, bastırmamalı.
- **Kırmızı turuncuya kaymamalı.** Sıcak gölge vermek isterken kumaşın kiraz kırmızısını turuncuya çevirmek kolaydır, ölçerek kontrol et.
- **Farklı koltuk tasarımlarını karıştırma.** Bu videodaki koltuk (kıvrımlı ceviz yan ayaklı) sitenin ana sayfasındaki koltukla aynı değil. Siteden koltuk görseli alma.
- **Videoya yazı koyma** (bölüm 1, kural 1).

### Yeniden klip üretmek gerekirse (yalnızca kullanıcı onaylarsa)

- **Kling 3.0 Pro'da yalnızca başlangıç karesi verip "yana kay" ya da "etrafında dön" demek** koltuğu döner tabla gibi kendi etrafında çeviriyor; duvar düz bir şekilde kayıyor.
- **Katmanlı bitiş karesi** (koltuğu odadan daha çok kaydırmak) gerçek bir yana kayma verdi. Ama kullanıcı reddetti, çünkü koltuk ile oda farklı hızlarda kayıyordu.
- **Kullanıcının istediği:** Koltuk ortada ve sabit, kamera koltuğa odaklı, ağır ağır yay çiziyor. Kabul edilen sonuç `4-yay.mp4`, yalnızca istemle (bitiş karesi yok) üretildi.
- **Desen ölçeği** istemle küçülmüyor. Yalnızca 3×3 döşenmiş kumaş referansı (`referans/panthera-3x3.jpg`) işe yaradı.
- **Her ücretli üretimden önce** yaklaşık fiyatı ("tahmini" diye) söyle ve onay al. Kullanıcı kendi kredisini ödüyor.
- **fal `balance_exhausted` (bakiye bitti) hatası:** Kullanıcıya bir kez söyle, kredi eklemesini bekle, sonra aynı `submission_key` ile yeniden gönder.
- **Durum öğrenmek için işi yeniden gönderme;** var olan işi oku.
- **fal anahtarı** yalnızca `FAL_KEY` ortam değişkeninde dursun. Hiçbir dosyaya yazma.
- **Silgi (Bria Eraser)** zeminde gölge izi bıraktı; ikinci bir geçiş gerekti. Silinen yeri her zaman büyüterek kontrol et.

### Teknik tuzaklar

- **Git Bash'te Windows yolu:** Çift tırnak içinde `"C:\...\\$c-genel.png"` yazınca `\$` kaçtı ve dosya adı bozuldu (`kontrol$c-genel.png`). Doğrusu: `O='C:\...\kontrol\'"$c-genel.png"`.
- **ffmpeg yeni kurulduysa** açık kabuk onu bulamaz. Yeni kabuk aç ya da tam yolu kullan.
- **Telefon çekimi HDR olabilir.** Tonemap yapılmazsa yapay zekâ planlarının yanında soluk ve gri durur. `ffprobe` ile kontrol et (bölüm 4, adım 2).
- **`xfade`** iki girişin boyutunun, kare hızının, piksel biçiminin ve zaman tabanının aynı olmasını ister; yoksa hata verir. Her iki girişe `fps=24,settb=AVTB,format=yuv420p` uygula.
- **Kare hızını karıştırma.** Yapay zekâ klipleri 24 kare/sn, telefon çekimi 60 kare/sn. Hepsi 24 kare/sn'ye çevrilmeden birleştirilmez.
- **Eski çıktıların üzerine yazma.** Her denemeyi yeni sürüm numarasıyla kaydet. Kullanıcı bir önceki sürüme dönmek isteyebilir.
- **`python -I`** kullanıcı paketlerini (ör. PyMuPDF) gizler. Bu tür betikleri `-I` olmadan çalıştır.

### İletişim

- **Kullanıcı teknik değil.** "Tonemap", "timebase" gibi terimleri kullanıcıya söyleme. Gerekirse sade bir örnekle anlat: "Telefon videosu fazla parlak kaydedilmiş, renkleri diğerlerine uyduruyorum" gibi.
- **Seçenek sunarken** her seçeneğin ekranda nasıl görüneceğini anlat. Mümkünse yan yana görsel göster.
- **Brief'e uymayan bir şey eklemeden önce sor.** Örnek: kartın altına satır eklemek, müzik koymak, yeni sahne eklemek.

---

## 2. Malzemeler

Kök klasör: `C:\Users\Beytullah KALAY\OneDrive\Desktop\tahtirevan\pazarlama-video\reels-2\`

### Onaylı yapay zekâ klipleri (`klipler\`)

Dört klibin teknik bilgisi aynı: **1072×1928 piksel, 24 kare/sn, 5,04 sn (121 kare), H.264, sessiz**.

| Sahne | Dosya | İçerik | Kullanılacak aralık |
|---|---|---|---|
| 3 | `klipler\3-ceviz-ayak.mp4` | Ceviz ayağa yakın çekim, kamera yana kayıyor | **Yalnızca 0,0–3,0 sn.** 3,5 sn'den sonra sol üst köşede bulanık bir leopar gözü belirip kayboluyor; o kısmı **asla** kullanma. |
| 4 | `klipler\4-yay.mp4` | Yan profil. Koltuk ortada ve sabit, kamera ağır ağır yay çiziyor, ön yüz yavaşça açılıyor | 3 sn'lik pencere, önerilen **2,0–5,0 sn**. Kare tablosuna bakıp 3. sahnedeki ayak kavisinin 4. sahnedeki sırt kavisiyle en iyi eşleştiği başlangıcı seç. |
| 5 | `klipler\5-arka-isik.mp4` | Arkadan 3/4 görünüm, kamera sabit, bulut açılınca ışık artıyor | 3 sn, önerilen **2,0–5,0 sn**. Kesme, ışığın en parlak anına denk gelmeli. |
| 6 | `klipler\6-final-v2.mp4` | Ana kareye (`oda-panthera-b.png`) doğru yavaş yaklaşma, yani videonun "kahraman" karesi | Son 3 sn, **2,0–5,0 sn**. Son 8 kare kapanış kartına yumuşak geçiş. |

**Kullanma:** `4-siluet.mp4`, `4-siluet-v2.mp4` ve `6-final.mp4` reddedildi.

**Vazo tutarlılığı (kontrol edildi):** Vazo 6. ve 5. sahnelerde var ve sabit; 4. ve 3. sahnelerde hiç görünmüyor. Hiçbir klipte vazo kendiliğinden belirip kaybolmuyor. Seçtiğin aralıklar bu durumu bozmamalı.

### Gerçek telefon çekimleri (sahne 1–2), henüz yok

- Kullanıcı bunları telefonla çekecek (plan: 4K, 60 kare/sn). Çekim talimatı `pazarlama-video\sinematografi-plani.md`, bölüm 8'de.
- Dosyalar şu adlarla konacak:
  - `reels-2\gercek\1-desen.*`: süslemenin ve leopar başının çok yakından çekimi
  - `reels-2\gercek\2-el.*`: elin kadifenin havını okşaması
- **Klasör boşsa:** "Yer tutuculu taslak" ile başla (bölüm 4, adım 2). Kullanıcıya çekimlerin beklendiğini bir cümleyle hatırlat.

### Diğer kaynaklar

- **Gerçek kumaş fotoğrafı:** `C:\Users\Beytullah KALAY\OneDrive\Desktop\tahtirevan\kumas-buyutulmus\panthera-hd.jpg` (2433×3000). Kapanış kartındaki şerit ve yer tutucu bu fotoğraftan yapılır.
- **Logo:** `site\public\brand\emblem.svg` (altın rengi çizgi amblem, rengi `#B08D57`). Açık zemin sürümü `emblem-light.svg`. Hazır PNG: `logo-512.png` (koyu zeminli).
- **Marka renkleri** (`site\app\globals.css`):

  | Ad | Renk | Kullanım |
  |---|---|---|
  | gece | `#14110F` | zemin |
  | fildişi | `#E9E1D3` | yazı |
  | altın | `#B08D57` | amblem |
  | lal | `#6E1F24` | (koyu kırmızı) |

  Serif yazı tipi **Cormorant Garamond**, düz yazı tipi Manrope.
- **Ana kare:** `reels-2\oda-panthera-b.png`
- **Tüm üretim geçmişi:** `pazarlama-video\README.md`. Planın tamamı: `pazarlama-video\sinematografi-plani.md`.

---

## 3. Kurgu (zaman çizelgesi)

Müzik dakikada 60 vuruşluk sade bir parça olacak. Her saniye bir vuruş olduğu için **bütün kesmeler tam saniyelere düşer**. Müziği kullanıcı Instagram'da ekleyecek; dışa aktarılan dosyada ses olmayacak.

| Zaman | Sahne | Kaynak | Not |
|---|---|---|---|
| 0–2 sn | 1 | `gercek\1-desen` | Gerçek, süsleme makro |
| 2–4 sn | 2 | `gercek\2-el` | Gerçek, el kadifeyi okşuyor |
| 4–7 sn | 3 | `3-ceviz-ayak.mp4` 0,0–3,0 | Sert kesme. Ayak kavisi bir sonraki planın sırt kavisine eşleşiyor. |
| 7–10 sn | 4 | `4-yay.mp4` ~2,0–5,0 | Sert kesme |
| 10–13 sn | 5 | `5-arka-isik.mp4` ~2,0–5,0 | Işığın en parlak anında kes |
| 13–16 sn | 6 | `6-final-v2.mp4` 2,0–5,0 | Son 8 kare (0,333 sn) kapanış kartına geçiş |
| 16–18 sn | Kapanış | `kart.mp4` | Logo, arkada %20 görünürlükte gerçek Panthera şeridi |

- **Toplam süre:** yaklaşık 17,7–18 sn. Geçiş üst üste bindiği için kartı 2,33 sn yap; kart böylece tam 2 sn görünür.
- **Geçişler:** Yalnızca 6. sahne ile kart arasında yumuşak geçiş var. Diğer bütün geçişler sert kesme; zoom, kayma ya da efektli geçiş kullanma.

---

## 4. Uygulama adımları

**Çalışma klasörleri** (yoksa oluştur):

- `reels-2\montaj\ara\`: normalize edilmiş parçalar
- `reels-2\montaj\kart\`: kapanış kartı
- `reels-2\montaj\kontrol\`: kare tabloları
- `reels-2\montaj\cikti\`: dışa aktarılan videolar

### Adım 0: ffmpeg

Bu bilgisayarda ffmpeg yok. Kurulumdan önce kullanıcıdan tek cümleyle onay al, örneğin: *"Videoları birleştirmek için ücretsiz ffmpeg programını kurmam gerekiyor (~100 MB), kurayım mı?"* Onay gelince:

```bash
winget install --id Gyan.FFmpeg -e --accept-source-agreements --accept-package-agreements
```

Kurulumdan sonra açık kabuk `ffmpeg` komutunu görmeyebilir. Yeni bir kabuk aç ya da tam yolu kullan; yol `%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg*\...\bin\ffmpeg.exe` altındadır. Kurulumu `ffmpeg -version` ve `ffprobe -version` ile doğrula.

### Adım 1: Yapay zekâ kliplerini normalize et (1080×1920, 24 kare/sn)

Klipler 1072×1928 boyutunda. Önce 1080 genişliğe büyüt (yükseklik 1942 olur), sonra ortadan 1920'ye kırp. Bu işlem üstten ve alttan yalnızca ~11 piksel atar. Örnek (Git Bash, `reels-2` klasöründen):

```bash
N='scale=1080:-2:flags=lanczos,crop=1080:1920,fps=24,setsar=1,format=yuv420p'
ffmpeg -y -ss 0 -t 3 -i klipler/3-ceviz-ayak.mp4 -vf "$N" -an -c:v libx264 -crf 14 -preset slow montaj/ara/03.mp4
ffmpeg -y -ss 2 -t 3 -i klipler/4-yay.mp4        -vf "$N" -an -c:v libx264 -crf 14 -preset slow montaj/ara/04.mp4
ffmpeg -y -ss 2 -t 3 -i klipler/5-arka-isik.mp4  -vf "$N" -an -c:v libx264 -crf 14 -preset slow montaj/ara/05.mp4
ffmpeg -y -ss 2 -t 3 -i klipler/6-final-v2.mp4   -vf "$N" -an -c:v libx264 -crf 14 -preset slow montaj/ara/06.mp4
```

- 4. ve 5. sahnelerin başlangıç saniyesini (`-ss`) kesinleştirmeden önce kaynak kliplerin kare tablosunu çıkar ve bak (bölüm 5'teki komut).
- İstersen 3. sahnede sol üst köşeyi biraz daha güvenceye almak için ~%4 yakınlaştır: `scale=1124:-2,crop=1080:1920`. Bu zorunlu değil, çünkü 0–3 sn arasında göz yok.

### Adım 2: Sahne 1–2 (gerçek çekim veya yer tutucu)

**Gerçek çekim geldiyse:**

1. `ffprobe` ile renk aktarımını (`color_transfer`) kontrol et. Değer `arib-std-b67` ya da `smpte2084` ise çekim HDR'dir; tonemap gerekir, yoksa renkler soluk ve gri görünür:

   ```
   zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p
   ```

2. **Ağır çekim (önerilen):** 60 kare/sn çekimi 24 kare/sn'de 2,5 kat yavaşlat: `setpts=2.5*PTS,fps=24`. Bu durumda 2 sn'lik çıktı için kaynaktan en iyi **0,8 sn**'yi seç. Seçim için tüm çekimin kare tablosunu çıkar.
3. **Kadraj:** Dikey 4K çekim için `scale=1080:1920` yeterli. Yatay çekildiyse ortadan 9:16 kırp, ama kırpmayı desenin ya da elin en iyi göründüğü yere kaydır.
4. **Sonuç dosyaları:** `montaj/ara/01.mp4` ve `montaj/ara/02.mp4`, her biri tam 2,0 sn, aynı x264 ayarlarıyla.

**Çekim yoksa (yer tutuculu taslak):** `panthera-hd.jpg`'den iki adet 2 sn'lik yavaş yaklaşma yap. Önce 9:16 kırp, sonra zoom uygula:

```bash
F='/c/Users/Beytullah KALAY/OneDrive/Desktop/tahtirevan/kumas-buyutulmus/panthera-hd.jpg'
ffmpeg -y -loop 1 -i "$F" -vf "crop=1687:3000,scale=2160:3840,zoompan=z='1.10+0.0010*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=48:s=1080x1920:fps=24,format=yuv420p" -frames:v 48 -c:v libx264 -crf 14 montaj/ara/01.mp4
```

- `02.mp4` için başka bir bölge seç (`x`/`y` değerlerini kaydır) ya da daha yakın bir başlangıç zoom'u kullan.
- Bu parçaları içeren çıktının adında `taslak` kelimesi geçsin. Kullanıcıya bunun yer tutucu olduğunu söyle.

### Adım 3: Kapanış kartı (2,33 sn)

**Görünüm:**

- Zemin `#14110F`.
- Ortada yatay bir **gerçek Panthera şeridi**: `panthera-hd.jpg`'den kırpılmış, ~1160×640 piksel, **%20 opaklıkta**, 2,33 sn boyunca soldan sağa ~35 piksel ağır ağır kayıyor.
- Üstte ortada **altın amblem** (`emblem.svg`, ~360 piksel genişlik). Altında **TAHTIREVAN** yazısı: Cormorant Garamond, fildişi `#E9E1D3`, geniş harf aralığı.
- Yazının biçimini sitedeki başlıktan/logodan bak (`site\components` içinde marka adı nasıl yazılıyorsa öyle) ve aynı şekilde yap.
- Amblem ve yazı 0,15 sn'de başlayıp 0,5 sn'lik bir solmayla belirsin.

**Yapım:**

1. Logo ve yazıyı içeren saydam zeminli bir **1080×1920 PNG** hazırla (`montaj/kart/logo-kart.png`). En kolayı küçük bir HTML sayfası:
   - Google Fonts'tan Cormorant Garamond'u yükle, `emblem.svg`'yi `<img>` olarak koy, zemini saydam yap.
   - Başsız Edge ile ekran görüntüsünü al:

     ```bash
     msedge --headless=new --default-background-color=00000000 --window-size=1080,1920 --screenshot=<yol> <html>
     ```

   - Windows yolunda dikkat: Git Bash'te çift tırnak içinde `\\$degisken` yazma, `$` kaçar ve dosya adı bozulur. Tek tırnaklı ön ek + `"$degisken"` kullan.
   - Alternatif: SVG'yi `site/node_modules/sharp` ile PNG'ye çevir. Bu durumda yazı tipi için TTF gerekir.
2. Şeridi hazırla: `montaj/kart/serit.png`, 1160×640, `panthera-hd.jpg`'den.
3. Birleştir:

   ```bash
   ffmpeg -y -f lavfi -i "color=c=0x14110F:s=1080x1920:r=24:d=2.333" -loop 1 -i montaj/kart/serit.png -loop 1 -i montaj/kart/logo-kart.png \
     -filter_complex "[1]format=rgba,colorchannelmixer=aa=0.20[s];[0][s]overlay=x='-40+t*15':y=(H-h)/2[a];[2]format=rgba,fade=in:st=0.15:d=0.5:alpha=1[l];[a][l]overlay=0:0,format=yuv420p" \
     -t 2.333 -r 24 -c:v libx264 -crf 14 montaj/ara/kart.mp4
   ```

4. **"Siparişle üretilir · 3 ay" satırı:** Planda logonun altında bu satır vardı. Bu bir uyarı değil, satış bilgisi; ama kullanıcı "yazı yok" dediği için **varsayılan olarak koyma**. Kartı gösterirken kullanıcıya tek cümleyle sor: *"Logonun altına küçük harflerle 'Siparişle üretilir · 3 ay' ekleyelim mi?"*

### Adım 4: Birleştir, renk düzelt, dışa aktar

**Renk düzeltme (grade) kuralları:**

- Önce yalnızca video sahnelerine (1–6) **tek ve ortak** bir renk düzeltmesi uygula; kapanış kartına uygulama.
- Ardından tüm videoya (kart dahil) tek bir ortak **film greni** ve hafif **halation** (parlak noktaların çevresinde sıcak, kırmızımsı ışıma) ekle.
- **Hedef:** sıcak gölgeler; **turuncuya kaçmayan derin kiraz kırmızısı**; temiz kremler.
- **Kumaşı soldurma.** Kullanıcı daha önce "solgun film" görünümünü, kumaşı gizlediği için reddetti. Doygunluğu düşürme.
- Telefon ve yapay zekâ planları yan yana aynı dünyadan gelmiş gibi durmalı. Gerekirse renk düzeltmesinden önce telefon parçalarına küçük bir eşitleme yap (ör. `eq=gamma=..`, `colorbalance`).

Başlangıç noktası (değerler deneme içindir, sonucu ölçerek ayarla):

```bash
ffmpeg -y -i montaj/ara/01.mp4 -i montaj/ara/02.mp4 -i montaj/ara/03.mp4 -i montaj/ara/04.mp4 -i montaj/ara/05.mp4 -i montaj/ara/06.mp4 -i montaj/ara/kart.mp4 \
  -filter_complex "\
[0][1][2][3][4][5]concat=n=6:v=1:a=0,colorbalance=rs=0.02:bs=-0.02:rm=0.01:bm=-0.01,eq=contrast=1.03,fps=24,settb=AVTB,format=yuv420p[body];\
[6]fps=24,settb=AVTB,format=yuv420p[card];\
[body][card]xfade=transition=fade:duration=0.333:offset=15.667,format=gbrp,split[base][hi];\
[hi]curves=all='0/0 0.78/0 1/1',gblur=sigma=20,colorchannelmixer=rr=1:gg=0.30:bb=0.18[h];\
[base][h]blend=all_mode=screen:all_opacity=0.10,format=yuv420p,noise=c0s=5:c0f=t+u[v]" \
  -map "[v]" -an -r 24 -c:v libx264 -profile:v high -crf 16 -preset slow -pix_fmt yuv420p -movflags +faststart \
  montaj/cikti/reels-2-v1.mp4
```

**Kırmızı kontrolü (zorunlu):**

1. Aynı kareyi renk düzeltmesinden önce ve sonra çıkar (ör. 6. sahnenin son karesi).
2. `sharp` (`site/node_modules/sharp`) ile kumaşın kırmızı zemininden bir bölgenin ortalama ton açısını ve doygunluğunu ölç.
3. Ton turuncuya doğru ~3–4°'den fazla kaymamalı, doygunluk düşmemeli.
4. Önce/sonra karelerini yan yana bir görselde kullanıcıya göster.

**Dışa aktarma (çıktı):**

- 1080×1920, 24 kare/sn, H.264 High, yuv420p, `+faststart`, ses yok.
- Ad sırası: `reels-2-v1.mp4`, `-v2`, ... Yer tutuculu sürümün adı `reels-2-taslak-v1.mp4` olsun.
- Eski sürümlerin üzerine yazma.

---

## 5. Kalite kontrolü (kullanıcıya göstermeden önce)

**Kare tablosu:**

```bash
ffmpeg -y -i montaj/cikti/reels-2-v1.mp4 -vf "fps=4,scale=216:-1,tile=9x8" -frames:v 1 montaj/kontrol/v1-4fps.png
```

Belirli bir aralığı (ör. kesme noktaları) yakından görmek için: `-ss 6.5 -t 1 -vf "fps=12,scale=360:-1,tile=6x2"`.

**Kontrol listesi:**

- [ ] Kesmeler tam saniyelerde: 2, 4, 7, 10, 13 ve geçiş 15,67'de. `ffprobe` ile toplam süre ~18,0 sn.
- [ ] 3. sahnede sol üstte göz yok. Kesme noktasını 12 kare/sn'de büyüterek kontrol et.
- [ ] Leopar başlarında göz kırpma ya da desen erimesi yok. Yüzleri 12 kare/sn'de büyüterek bak.
- [ ] Vazo yalnızca 5. ve 6. sahnelerde var ve sabit; hiçbir yerde belirip kaybolmuyor.
- [ ] **Arka plan hareketini kontrol et.** Duvar, pencere ve zemin çizgileri olması gerektiği gibi hareket ediyor ya da duruyor mu? Kullanıcı daha önce iki kez, benim yanlış okuduğum hareketi yakaladı. 4. sahnede koltuk merkezde sabit kalmalı, kamera yay çizmeli; koltuk dönüyor ya da kayıyor gibi görünmemeli.
- [ ] Videonun hiçbir yerinde yazı yok (kart hariç; kartta yalnızca logo ve marka adı).
- [ ] Kırmızı turuncuya kaçmamış, kremler temiz, gren ince (telefonda görünür ama rahatsız etmez).
- [ ] Başta ve sonda siyah kare ya da donma yok. Kart tam 2 sn okunuyor.

Sonra kullanıcıya şunları gönder (`SendUserFile`) ve sade bir dille neyi kontrol etmesi gerektiğini yaz:

- videoyu,
- kare tablosunu,
- kırmızı önce/sonra görselini.

---

## 6. Kullanıcıya iletilecek notlar (son teslimde bir kez)

- **Müzik:** Instagram'da eklenecek. Dakikada 60 vuruşluk sade bir parça seçilmeli (pes davul, ud ya da ney). Kesmeler her saniyeye denk geldiği için vuruşa oturur.
- **Instagram "Yapay zekâ bilgisi" etiketi:** Meta, gerçekçi görünen yapay zekâ içeriğinde paylaşım sırasında bu etiketin açılmasını istiyor. Bu, videonun üstüne yazı koymak değil; Instagram'ın paylaşım ekranındaki bir ayar. Videodaki görüntü değişmez. Kumaş gerçek, koltuk siparişle üretiliyor. Açıklama metninde bunu yazmak güven verir.
- **Kapak karesi önerisi:** 6. sahnenin son karesi (ana kare).

---

## 7. Bitince

- `pazarlama-video\README.md` dosyasının sonuna kısa bir "Reels 2 montaj" bölümü ekle: kullanılan aralıklar, renk değerleri, çıktı dosyası adı.
- Commit atma.
- Telefon çekimleri sonradan gelirse yalnızca Adım 2 ve Adım 4'ü yeniden çalıştırmak yeterli. Diğer parçalar `montaj\ara\` içinde hazır duruyor.
