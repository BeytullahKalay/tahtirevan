---
name: reels-montaj
description: Tahtırevan Reels/video montajı rehberi (ffmpeg ile yerelde). Kullanıcı bir Reels'i birleştirmek, kesmek, renk ayarı yapmak, kapanış kartı/logo eklemek, telefon çekimini AI klipleriyle eşleştirmek, kare tablosu çıkarmak ya da videoyu Instagram'a hazırlamak istediğinde kullan. pazarlama-video/ klasörü, MONTAJ-DEVIR.md, reels-1/reels-2 montaj/ klasörleri bu konuya girer.
---

# Reels montajı (ffmpeg)

Önce ilgili reel'in devir dosyasını oku (ör. `pazarlama-video/reels-2/MONTAJ-DEVIR.md`). Bu skill, o dosyaların üstüne genel araç bilgisini ve gerçekten yaşanmış tuzakları ekler.

## Araçlar

- **ffmpeg 9 (Gyan full build)** winget ile kurulu ama açık kabuklar PATH'i görmeyebilir. Her Bash çağrısının başına:
  ```bash
  export PATH="/c/Users/Beytullah KALAY/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin:$PATH"
  ```
  `zscale`, `tonemap`, `xfade`, `zoompan`, `huesaturation`, `drawtext` var.
- **Kırmızı ölçer:** `node pazarlama-video/araclar/kirmizi-olc.cjs once.png sonra.png [sonra2.png ...]`. Önce karesindeki kırmızı kumaş piksellerini maskeler, aynı piksellerin ton açısını (0 = saf kırmızı, artı = turuncu), doygunluğunu ve gri duvar RGB'sini verir. `site/node_modules/sharp` kullanır.
- **Logo/kart PNG'si:** küçük bir HTML + başsız Edge (`"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 --window-size=1080,1920 --virtual-time-budget=8000 --screenshot=...`). Google Fonts için `--virtual-time-budget` şart, yoksa yazı tipi yüklenmeden çekilir. Örnek: `reels-2/montaj/kart/logo-kart.html`.
- **DaVinci Resolve gerekmiyor.** Ücretsiz sürümü dışarıdan komutla tam yönetilemiyor; ekran tıklamasıyla sürmek yavaş ve hataya açık. ffmpeg her kareyi ölçülebilir ve tekrarlanabilir kılıyor. Kullanıcı elle ince ayar isterse Resolve'u kendisi kullanabilir.

## Renk tuzakları (en önemli)

1. **Renk matrisi (BT.709).** ffmpeg, etiketsiz videoyu RGB'ye çevirirken BT.601 varsayar; telefonlar ve Instagram HD videoyu BT.709 sayar. Sonuç: kırmızı birkaç derece kayar ve ölçüm yalan söyler (Reels 2'de "6° turuncuya kaydı" sanıldı, gerçek kayma 1,3° idi).
   - Görselden (JPG/PNG) video yaparken sonuna: `scale=out_color_matrix=bt709:out_range=tv,format=yuv420p`
   - Videodan ölçüm karesi alırken: `scale=in_color_matrix=bt709:in_range=tv,format=rgb24`
   - RGB'de işlem (halation, blend) için: `scale=in_color_matrix=bt709:in_range=tv:out_range=pc,format=gbrp` ... `scale=out_color_matrix=bt709:out_range=tv,format=yuv420p`
   - Çıktıya etiket: `-color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709`
2. **Tam aralık (yuvj420p) çıkmasın.** `ffprobe ... stream=pix_fmt,color_range` ile `yuv420p` ve `tv` olduğunu doğrula.
3. **Önce/sonra karşılaştırması aynı yoldan alınmalı:** iki kare de aynı matrisle çıkarılmalı, aynı pikseller ölçülmeli.
4. **Kırmızıyı koruyan ısıtma:** mavi kısmak ya da yeşil eklemek kırmızıyı turuncuya iter. Isıttıktan sonra kırmızıyı geri çevir: `huesaturation=hue=-4:saturation=0.04:colors=r:strength=1`. Reels 2'de onaylanan değer:
   `colorbalance=rs=0.015:gs=0.004:bs=-0.006,eq=contrast=1.03,huesaturation=hue=-4:saturation=0.04:colors=r:strength=1` (ton kayması −0,04°, doygunluk +%6).
5. Renk denemelerini bütün videoda değil, sahnelerden birer kareyi `hstack` ile tek kareli bir videoya koyup yap; hızlıdır.

## Kurgu tuzakları

- Her parçayı `-frames:v N` ile tam kare sayısına kes (24 kare/sn'de 2 sn = 48, 3 sn = 72). Sonra `ffprobe -count_frames` ile doğrula.
- `xfade` için iki girişe `fps=24,settb=AVTB,format=yuv420p`; offset = gövde kare sayısı/24 − geçiş süresi. Toplamı `-frames:v` ile sabitle.
- Durağan görselden yaklaşma: görseli önce 4 kat büyüt (`scale=4320:7680`) sonra `zoompan`; yoksa titrer.
- Kaynak klipte en parlak anı ya da sıçramayı tahminle değil ölçerek bul:
  - parlaklık: `signalstats` + `metadata=print:key=lavfi.signalstats.YAVG`
  - sıçrama: `scdet=threshold=0` + `metadata=print:key=lavfi.scd.score`, en yüksek skorlu kareleri büyüterek incele.
- `drawtext` yazı tipi yolu için Windows yolu kaçışla bozuluyor; `.ttf`'i çalışma klasörüne kopyalayıp göreli yol ver (`fontfile=f.ttf`).
- Kabuk değişkeniyle `rm -f $X/*` yazma; güvenlik denetimi engelliyor. Zaten `-y` ile üzerine yazılıyor.

## Kalite kontrolü (göstermeden önce)

- 4 kare/sn kare tablosu: `fps=4,scale=216:-1,drawtext=...%{pts\:hms}...,tile=9x8`
- Kesmeler: kesme karelerinin ±2 karesi `select='between(n,a,b)+...'` ile tek tabloda.
- Yüzler/desen: sahneyi kırpıp 6–12 kare/sn'de büyüt.
- Arka plan hareketini sabit referanslarla (duvar köşesi, pencere, süpürgelik) anlat; koltuk mu oda mı hareket ediyor açıkça yaz.
- Kullanıcıya video + kare tablosu + kırmızı önce/sonra görselini `SendUserFile` ile gönder, sade dille ne kontrol edeceğini yaz.
