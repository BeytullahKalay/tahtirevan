# Hikâye sayfası: Desenlerin yolu (tasarım)

Tarih: 23 Kasım 2026 · Durum: onay bekliyor

## Amaç ve neden

Hikâye sayfasını (`/hikaye`, `/en/story`) okuyan bir iç mimar, sayfanın sonunda görüşme talep etmek istemeli. Markanın 12 aylık hedefi düzenli çalışılan 3 iç mimar ya da satılmış 6+ parça; bu sayfa o görüşmeye giden yolun bir parçası.

Kullanıcı için hikâye anlatıcılığı önemli. Bugünkü sayfa hikâye anlatmıyor; kullanıcı UX'ini hiç sevmedi. Açılıştaki çizimli kafile sahnesi (StoryCaravan) de "zarif bir markanın yapacağı bir şey değil" diye reddedildi.

Hikâye "desenlerin yolu"ndan başlar. Her desen bir yoldan geldi, yollar Anadolu'da buluştu ve o yollarda tahtırevan yürüdü. Bugün bu yolculuk tek bir kişi için yapılan bir parçada tamamlanıyor. Yolun sıradaki durağı da okuyan mimarın projesi.

## Hedefler

- Sayfa baştan sona tek bir hikâye anlatır; göz gezdiren biri bile şehirleri ve desenleri görür.
- Her tarihsel durakta sitedeki gerçek bir kumaş görünür. Mimar hikâyeyi dinlerken kumaşları da görmüş olur.
- Tarihteki yol, markanın kendi yoluna (koleksiyonlar = duraklar) bağlanır ve görüşme davetinde biter.
- Lüks bir markaya yakışan sakinlik: az hareket, büyük yazı, gerçek malzeme.

## Hedef dışı

- İşleyiş ve süreç adımları (görüşme, numune kutusu, atölye, teslimat). Bunlar Size Özel sayfasında var; burada tekrarlanmaz.
- Hikâye metinlerini admin paneline taşımak. Metinler bugünkü gibi `StoryView.tsx` içindeki `COPY` nesnesinde kalır.
- Yeni kumaş görseli üretmek ya da yeni kumaş eklemek.

## Kaçınılacaklar (bunlar olursa, çalışsa bile başarısız sayılır)

- Elle çizilmiş figürlü sahne: deve, insan, şehir silueti, harita çizimi. Tek çizim öğesi ince altın yol çizgisi ve duraklardaki baklava işaretleridir.
- Kurucunun adı, imzası ya da unvanı. Sitede hiçbir yerde geçmez; metinler marka ağzından konuşur.
- Eski Serir koltuk fotoğrafı ya da ondan kırpımlar.
- Bugün doğru olmayan sözler ("el oyması ceviz", "420 saat, tek usta" gibi).
- Bilgi birikimindeki kaçınılacak motifler: servi, tek merkezi öğeli sivri kemer, Yunan/Roma figürleri, Avrupa akantusu ve barok. Yol bağı olmayan kültürler (Japon boro, Afrika adire, Navajo) de girmez.
- Sayfanın ilk açılışta saniyelerce boş kalması.

## Seçilen yön: B · Yol çizgisi

Kullanıcıya üç yön gösterildi (`.superpowers/brainstorm/.../content/hikaye-yol.html`). Hikâye üçünde de aynıydı, değişen yalnızca sunuluştu:

| Yön | Nasıl | Artısı | Eksisi |
|---|---|---|---|
| A · Uzun okuma | Tek sütun dergi yazısı, durak başına tam genişlik kumaş | En sade, en hızlı kurulan | Hareket az; "yol" hissi yazıya kalıyor |
| **B · Yol çizgisi** | Sayfa boyunca inen ince altın çizgi, kaydırdıkça uzar; her durakta baklava yanar, şehir + desen + kumaş + kısa cümle | Yol fikri görsel olarak var ama çizim yok; göz gezdirerek okunur | A'dan biraz daha fazla iş |
| C · Sabit sahne | Ekran sabit kalır, kumaş ve yazı durak durak değişir | En sinematik | Kurması en zor; telefonda riskli; kaydırma uzun |

Kullanıcı **B**'yi seçti.

## Sayfa akışı ve metin

Metinler taslaktır; TR ve EN birlikte yazılır. Tarihsel cümleler doğru olmalı ve kısa kalmalı (bir durakta en fazla iki cümle).

### 1. Açılış

- Etiket: "Hikâye" / "Story"
- Başlık: "Her desen bir yoldan geldi." / "Every pattern came by a road."
- Alt satır: "Ve bütün yollar Anadolu'dan geçti." / "And every road passed through Anatolia."
- Altın çizgi başlığın hemen altında başlar ve aşağı iner. Açılış görseli yok: sayfa yazıyla ve çizginin başlangıcıyla açılır.
- Giriş CSS ile yapılır (`.rise`, `.word-rise`); JavaScript beklenmez.

### 2. Desenlerin yolu (tarihsel duraklar)

Her durak: şehir (altın, küçük harf aralıklı etiket), desen adı (serif başlık), en fazla iki cümle, kumaş görseli ve altında "Kumaş adı · motif" yazısı.

| Sıra | Şehir / bölge | Desen | Kumaş | Metin (TR taslak) |
|---|---|---|---|---|
| 1 | Şam | Damask | Sapphire | Kumaşa dokunan desene bugün hâlâ şehrin adıyla, damask diyoruz. |
| 2 | İran | Buta | Soraya | Bir damla, bir alev, bir tohum. Buta İran'dan çıktı, şallarda dünyayı dolaştı. |
| 3 | Bozkır | At | Ardente | Bozkırın sanatında hayvan bir süs değildi; koşan, bakan bir figürdü. |
| 4 | Venedik ve Bursa | Nar | (yok) | Nar ve enginar, iki şehrin kadifeleri arasında yüzyıllarca gidip geldi. |

- Nar desenli bir kumaşımız yok; 4. durak görselsiz, yalnızca yazıyla durur. Bu bilinçli: yolun her durağında bizim kumaşımız olmak zorunda değil.
- Kumaşlar `getFabric(id)` ile gelir. Kumaş yayından kalkmışsa ya da veritabanı boşsa durak görselsiz gösterilir (bugünkü `shots` mantığı gibi).

### 3. Anadolu: kavşak

Yolun en belirgin durağı; baklava daha büyük, başlık daha büyük.

- Başlık: "Bütün yollar Anadolu'da buluştu."
- Metin (bugünkü "Bir taht, yolda" bölümünden kısaltılır): "Desenleri kervanlar taşıdı. Hükümdarları, saray kadınlarını ve uzun yola çıkan büyükleri ise tahtırevan: iki hayvanın ya da omuzların taşıdığı, perdeli bir oturak. Adı da bunu söyler: taht ve revan, yürüyen taht."
- Görsel: Zafran (madalyon), geniş.

### 4. Bugün: yol bir koltukta durur

Bugünkü "Sahibi için yapılan" ve "Bugün" bölümlerinin özü:

- Başlık: "Yol bir koltukta durur."
- Metin: "Her tahtırevan sahibine göre yapılırdı. Biz de öyle yapıyoruz: seri üretim yok, stok yok. Her parça tek bir kişi için başlar ve hikâyesini üç imzada taşır: nakış, püskül ve pirinç damga. Kumaşlarımız ailemizin kumaş geleneğinden gelir."

### 5. Markanın durakları (koleksiyonlar)

Altın çizgi kesintisiz devam eder; tarihteki yol markanın yoluna dönüşür.

- Kısa giriş: "Koleksiyonlarımız bu yolun duraklarıdır."
- Bugünkü `RoadStops` bileşeni ve `roadStops()` verisi kullanılır (panelden gelen yayındaki koleksiyonlar ve boş "sıradaki durak"lar). `RoadStops` ana sayfada da kullanılıyor; ana sayfanın görünüşü değişmemeli. Hikâye'de çizgiye uymak için görünüş değişikliği gerekirse bileşene bir seçenek (ör. `variant`) eklenir; veri mantığı değişmez. *(Benim kararım.)*

### 6. Davet

- Çizgi burada son baklavaya varır ve biter.
- Başlık: "Yolun bir sonraki durağı, sizin projeniz." / "The next stop on the road is your project."
- Alt satır: "Kumaşları birlikte inceleyelim." / "Let's look at the fabrics together."
- Ana düğme: "Görüşme talep edin" → `href(lang, "consultation")`.
- İkincil bağlantı: "Nasıl çalıştığımız" → Size Özel sayfası (`href(lang, "bespoke")`, `/size-ozel` · `/en/bespoke`).

### Kaldırılanlar

- Kurucu notu bölümü tümüyle kalkar. Adsız bir alıntı sahipsiz görünüyordu; içindeki fikir ("sahibini bir ömür boyu taşımak") 4. bölüme yedirilebilir. *(Benim kararım.)*
- Üç numaralı bölüm düzeni ("01 Bir taht, yolda" vb.) kalkar; içerikleri 3. ve 4. bölümlere taşınır.
- Açılıştaki `StoryCaravan`.

## Görünüş ve hareket

**Yol çizgisi**
- 1 px, altın (`altin` rengi). Geniş ekranda sol üçte birlik kolonda, telefonda sol kenardan ~24 px içeride durur.
- Kaydırdıkça yukarıdan aşağı uzar: `useScroll` + `scaleY` (transform; origin üst). Opaklık kullanılmaz. Gerekirse CLAUDE.md'deki fonksiyon biçimi kullanılır.
- Henüz varılmamış kısım soluk altın olarak görünür (%25). Böylece yolun nereye gittiği baştan belli olur.

**Duraklar**
- Baklava işareti: 7–9 px, 45° dönmüş kare, altın çerçeve. Çizgi o noktaya varınca içi dolar.
- Anadolu durağı ve son davet durağı daha büyük (12–14 px).
- Durak içeriği görünüme girince sakin bir yükselişle belirir (mevcut `Reveal`).

**Yerleşim**
- Geniş ekran (1440): çizgi solda; durak metni çizginin sağında, kumaş görseli metnin sağında ve büyük (4:5 ya da 4:3, sırayla). Durak başına yaklaşık bir ekran yüksekliği.
- Telefon (390): çizgi solda, her şey sağında tek sütun; kumaş metnin altında, tam genişlik.
- Kumaş görselleri `Media` bileşeniyle; `.media-inner` 1 px taşma ve karartma kuralları geçerli.

**Erişilebilirlik**
- `prefers-reduced-motion`: çizgi baştan tam çizili, baklavalar dolu, içerik hareketsiz.
- Çizgi ve baklavalar `aria-hidden`; duraklar başlık sırasına uygun (`h2`/`h3`).

## Dosyalar

- `site/components/views/StoryView.tsx`: yeniden yazılır (COPY + düzen).
- Yeni: `site/components/StoryRoad.tsx` (istemci bileşeni: çizgi, ilerleme, baklavalar). Adı ve bölünüşü kurucuya bırakılır.
- `site/components/RoadStops.tsx`: gerekirse yalnızca Hikâye'ye özel bir görünüş seçeneği (ana sayfa aynı kalır).
- Silinir: `site/components/StoryCaravan.tsx` ve `globals.css` içindeki `.caravan-hint` kuralları. Silmeden önce, aynı dosyada çalışan diğer oturumun işinin bitip bitmediğine bakılır.
- Kalır: `site/lib/emblem.ts` (HeroCard kullanıyor).

## Kısıtlar

- Next.js 16, Tailwind v4, Framer Motion 12; CLAUDE.md'deki animasyon ve görsel kuralları.
- Port 3100'deki geliştirme sunucusu açıkken `npm run build` çalıştırılmaz.
- Kontrol: 1440×900, 1440×700 ve 390×844; tarayıcı konsolunda hata yok, yatay taşma yok. Ardından `npx tsc --noEmit`.

## Kurucuya bırakılanlar

- Durak başına kesin boşluklar, yazı boyları, görsel oranları.
- Çizginin tam başlangıç ve bitiş noktaları.
- `RoadStops`'un çizgiye nasıl oturtulacağı (ana sayfa görünüşü ve veri değişmez).
- EN metinlerin son hâli (TR taslaktan çevrilir; sade, kısa).

## Açık konu

- 24 Kasım: kullanıcının isteğiyle Venedik ve Bursa (nar) durağı şimdilik kaldırıldı. Nar desenli bir kumaş olursa geri eklenebilir.
