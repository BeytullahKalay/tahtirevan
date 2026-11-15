# Tahtırevan · çalışırken dikkat edilecekler

Site `site/` klasöründe: Next.js 15 (App Router), Tailwind v4, Framer Motion, three.js (@react-three/fiber + drei). Yerel sunucu `.claude/launch.json` içindeki `tahtirevan` ayarıyla 3100 portunda çalışır. Aşağıdakiler bu projede gerçekten yaşanmış hatalardan çıkarıldı; her maddenin yanında nedeni var.

## Geliştirme sunucusu

- **Sunucu açıkken `npm run build` çalıştırma.** İkisi de `site/.next` klasörüne yazar; build, açık sunucunun dosyalarını bozar ve site "efektler yok, bölümler boş" halde görünür. Doğru sıra: sunucuyu durdur → `npm run build` → `site/.next` klasörünü sil → sunucuyu yeniden başlat.
- **Dosya silip adını değiştirdikten sonra** sayfada `Failed to read source code from ...` hatası çıkarsa sunucuyu yeniden başlat; sunucu silinen dosyayı hafızasında tutuyor.
- **`next.config.ts` değişince** sunucuyu yeniden başlat; ayar canlı yüklenmez.
- Geliştirme modunda bir sayfanın ilk açılışı derleme yüzünden birkaç saniye sürer; bunu hata sanma, canlı sitede olmaz.

## Animasyon (Framer Motion)

- **Kaydırmaya bağlı opaklıkta dizi biçimini kullanma:** `useTransform(scrollYProgress, [0, 0.16], [1, 0])` opaklık için tarayıcının kaydırma zaman çizelgesine devrediliyor ve aralık dışında yanlış değer veriyor (başlık kaybolmuyordu). Fonksiyon biçimini kullan: `useTransform(p, (v) => 1 - seg(v, 0, 0.16))`.
- **Sayfa açılır açılmaz görünen girişleri CSS ile yap** (`.rise`, `.hero-enter`, `.word-rise`, `.orb-enter` sınıfları). Framer'ın `initial={{ opacity: 0 }}` değeri, JavaScript yüklenene kadar içeriği gizler; ilk açılışta ekran saniyelerce boş kalıyordu.
- Büyüyen/dönen büyük görsellere `filter: drop-shadow` verme; her karede yeniden çizilir ve telefonda takılır. Gölge için ayrı bulanık bir elips kullan.

## 3B sahne (three.js)

- **Bir elemana `relative` ile `absolute` gibi iki konum sınıfını birlikte verme.** Tailwind'de `relative` kazandı, kapsayıcının yüksekliği sıfır oldu ve 3B tuval 300×150 piksel kaldı. `ChairStudio` bu yüzden konum sınıfını `className`'den okuyor.
- **WebGL desteğini denetlerken açılan test bağlamını mutlaka kapat** (`WEBGL_lose_context`) ve denetimi oturumda bir kez yap. Kapatılmayan bağlamlar birikince tarayıcı en eskisini, yani çalışan sahneyi öldürüyordu; kumaş değişmiyor gibi görünüyordu.
- **Dokuları toplu yükleme.** `useTexture(11 dosya)` hepsi inene kadar sahneyi gizliyordu (~3,5 MB). Yalnızca seçilen kumaşın dokusu yüklenir (`loadFabricTexture`), üzerine gelince/dokununca önceden alınır (`prefetchFabric`).
- 3B dokular için büyük JPG değil, `public/fabrics/tex/*.webp` (en uzun kenar 1024) kullanılır.
- `ContactShadows` her karede yeniden çizilmesin: koltukla birlikte dönen grubun içinde ve `frames={1}`.

## Görseller

- **Next/Image'da AVIF açma.** Kodlaması çok yavaş; ilk açılışta görsel istekleri kuyrukta 20 saniye bekledi ("görseller yüklenmiyor"). `next.config.ts` yalnızca WebP ve az sayıda boyut kullanır.
- **Küçük, sabit boyutlu görselleri dönüştürücüden geçirme:** numuneler `public/fabrics/sw/`, kumaş şeridi `public/fabrics/tile/`, 3B `public/fabrics/tex/`; hepsi `unoptimized` ile sunulur. Bir kumaş JPG'si değişirse bu üç sürümü de yeniden üret.
- **Görseli aynı adla değiştirme;** dönüştürücü önbelleği eskisini göstermeye devam edebilir. Yeni ad ver ya da `site/.next/cache/images` klasörünü sil.
- **Fotoğraftan kırpım alırken temizlenmiş PNG'yi koyu zemine bindirip kırp.** Orijinal fotoğraftan alınan kırpımlarda beyaz stüdyo arka planı kaldı ve koyu sitede kötü göründü.
- **Görsel kartlarında kenar boşluğu bırakma.** Kart yüksekliği küsuratlı olunca tarayıcı hareketli (büyüyen) görsel katmanını ayrı yuvarlıyor; kartın altında 1 px açık çizgi kalıyordu. Bu yüzden `.media-inner` kenarlardan 1 px taşar, karartma katmanları `inset-[-2px]` ile görselden taşar, `.media` zemini sayfa zemini rengindedir. Yeni bir görsel/karartma katmanı eklerken aynı kuralı uygula.
- Ekranın ilk görünen görseline `priority` ver; ekranda görünmeyen büyük görselleri (açılıştaki tam ekran kumaş gibi) gerekene kadar yükleme.

## Mobil

- **Etkileşimin sonucu ekranda görünmeli.** Telefonda kumaş listesine inip dokununca 3B önizleme ekran dışında kalıyordu; kullanıcı "değişmedi" sandı. Önizleme artık seçim sırasında üstte sabit. Yeni bir seçici eklerken aynı şeyi denetle.
- Her değişikliği hem geniş (1440×900) hem kısa-geniş hem de telefon (390×844) ekranda kontrol et: açılışta başlık koltuğun üstüne biniyordu, telefonda kumaş daireleri koltuğun sırtını kapatıyordu.
- Telefonda sürekli büyüyen (`kenburns`) görselleri kapalı tut; ekranda olmayan döngüleri (kumaş şeridi, 3B sahne) durdur.

## İçerik

- **Brief'e uymayan bir şeyi eklemeden önce sor.** Katalogdaki 7 kumaş (Serengeti, Savana, Zebrano, Montana, Rodeo, Celeste, Floresta) brief gereği sitede yok; kullanıcı böyle kalmasını onayladı.
- **Kumaş açıklamaları görselle eşleşmeli.** Soraya ile Zafran'ın açıklamaları katalog görselleriyle ters çıkmıştı; görsel eklerken metni de kontrol et.
- Ürün fotoğrafındaki koltuğun gövdesi siyah metal; sitedeki "el oyması ceviz" metinleriyle uyuşmuyor. Bu açık bir konu, metinleri değiştirmeden önce kullanıcıya sor.

## Doğrulama

- Uygulamadaki tarayıcı paneli **gizliyken** kaydırma tetikleyicileri ve animasyonlar çalışmaz; ekran boş görünür ama site bozuk değildir. Paneli açtır ya da bilgisayardaki Chrome'u görünmez modda (`--headless=new --use-angle=swiftshader --enable-unsafe-swiftshader`) bir betikle sür.
- Test betiğinde sabit bekleme yerine sayfa adresinin değişmesini bekle; geliştirme modunda geçişler 3 saniyeyi aşabiliyor.
- Değişiklik bitince `npx tsc --noEmit` çalıştır; sonra (yukarıdaki sıraya uyarak) production build'i dene.

## Kullanıcıyla iletişim

- Kullanıcı Türkçe yazıyor ve barındırma/DNS gibi konularda yeni. Seçenek sormadan önce kavramı sade bir örnekle anlat; açıklamasız teknik soru kafa karıştırdı.
- Yayına alma henüz yapılmadı. tahtirevan.com Google Workspace üzerinden alındı: DNS'e site kaydı eklerken Gmail'in MX/TXT kayıtlarına dokunma.

## Araçlar

- Katalog PDF'ini okumak için PyMuPDF (`pip install --user pymupdf`) kullanıldı. `python -I` kullanıcı paketlerini gizler; bu modülü kullanan betiği `-I` olmadan çalıştır.
