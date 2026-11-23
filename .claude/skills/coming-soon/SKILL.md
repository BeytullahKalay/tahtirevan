---
name: coming-soon
description: tahtirevan.com'daki geçici "Yakında / Coming soon" sayfasının rehberi (coming-soon/ klasörü, Netlify). Kullanıcı yakında sayfasıyla ilgili bir şey sorduğunda ya da yaptırdığında kullan; sayfa metnini/görselini değiştirme, yerel önizleme (port 3200), Netlify'a yeniden yayınlama (netlify deploy --prod), "Haber ver" formu ve açılış listesi (Netlify Forms, acilis-listesi, CSV indirme, e-posta bildirimi), Netlify ayarları (görünürlük, rozet), tahtirevan.com DNS kayıtları (Squarespace, A/CNAME, Gmail MX/TXT), "site eski/Squarespace sayfası görünüyor" şikâyeti, HTTPS sertifikası ve tam siteye geçiş konuları buna girer.
---

# Tahtırevan · Yakında sayfası

tahtirevan.com şu an tam site değil, tek sayfalık bir **"Yakında"** duyurusu gösteriyor. Tam site (`site/`, Next.js + Payload) hazır olunca alan adı ona taşınacak. Bu sayfa ondan tamamen bağımsız, düz HTML.

Kullanıcı Türkçe yazıyor ve barındırma/DNS konularında yeni. Her adımı sade anlat; bir kavramı ilk kez kullanırken küçük bir benzetme yap (ör. DNS = "tabelayı dükkânın kapısına asmak").

## Dosyalar (`coming-soon/`)

| Dosya | Ne işe yarar |
| --- | --- |
| `index.html` | Sayfanın tamamı: CSS, TR/EN metinler, form, JS hepsi içinde |
| `assets/` | `fabrics/*.webp` (11 kumaş, 360×360), `og-2.jpg` (paylaşım görseli 1200×630), `apple-touch-icon.png`, `monogram.svg`. `chair*.webp` ve `og.jpg` eski, sayfada kullanılmıyor |
| `netlify.toml` | Yayın ayarı: klasörün kendisi yayınlanır (`publish = "."`), yönlendirmeler, güvenlik başlıkları |
| `dev-server.mjs` | Yalnızca yerel önizleme sunucusu. Canlıda `netlify.toml` onu ana sayfaya yönlendirir |
| `robots.txt`, `package.json` | Küçük yardımcı dosyalar |

Sayfanın yapısı:
- **Dil:** `<html lang>` ve `[data-l="tr"|"en"]` ile çalışır. Açılışta tarayıcı diline bakılır; seçim `localStorage` içinde `tr-lang` adıyla saklanır. Her metin iki dilde yazılır.
- **Animasyonlar:** Hepsi CSS ile yapılır. `prefers-reduced-motion` desteklenir. Sekme gizlenince animasyonlar durur.
- **Kumaş şeridi:** Aynı 11 kumaş 4 kez tekrarlanır; şerit 90 saniyelik döngüyle kayar.
- **Yazı tipleri:** Google Fonts'tan Cormorant Garamond ve Manrope (latin-ext).
- **Kurallar:** Ana sitenin kuralları burada da geçerli: renk yalnızca kumaştan gelir, fiyat yoktur, metinler marka diliyle yazılır. Brief'te olmayan bir şeyi eklemeden önce kullanıcıya sor.

## Yerel önizleme

`.claude/launch.json` → `coming-soon` ayarı (`node coming-soon/dev-server.mjs`) → **http://localhost:3200**

- Yerel sunucu formu sahte yanıtla karşılar. Gönderilen veriyi konsola yazar (`[notify] (yerel, e-posta gönderilmedi) …`), hiçbir yere kaydetmez.
- `dev-server.mjs` dosyasını değiştirdiysen sunucuyu durdurup yeniden başlat.
- `npx serve` gibi indirme gerektiren önizleme araçlarını kullanma; otomatik izin denetimine takıldı.
- Kontrolü hem 1440×900 ekranda hem de telefon boyutunda (390×844) yap. Yatay kaydırma çıkmamalı.

## Yayına alma (Netlify)

Netlify projesinin adı **tahtirevan**, Site ID'si `03a2575d-9628-4b4a-9781-c6d021693799`. Proje "Beytullah KALAY's team" ekibinde.

Yeniden yayınlamak için tek komut yeter. **Komutu kullanıcı çalıştırır:** Claude'un `netlify-cli` çalıştırması otomatik izin denetimine takıldı ("Unauthorized Access"). Komutu kullanıcıya `bash` kod bloğu içinde ver; uygulama yanına bir Run düğmesi koyar.

```bash
cd "C:\Users\Beytullah KALAY\OneDrive\Desktop\tahtirevan\coming-soon"; npx netlify-cli deploy --prod
```

- Klasör zaten projeye bağlı, komut soru sormaz. Bağlantı kopmuşsa komut "Link this directory to an existing project" diye sorar; bu seçenekle **tahtirevan** projesini seç.
- Yayının çıkıp çıkmadığını anlamak için canlı HTML'deki `<form …>` satırına bak. Netlify formu işlediğinde `data-netlify` özniteliğini siler ve tırnakları tek tırnağa çevirir. Örnek kontrol: `curl -s https://tahtirevan.com/ | grep -o '<form[^>]*>'`.
- Netlify'ın ücretsiz planı ticari kullanıma izin verir. Aylık kullanım sınırı aşılırsa site ücret çıkarmaz, durdurulur. Her yayın aylık krediden düşer; gereksiz yere tekrar tekrar yayınlama.

### Netlify paneli ayarları (app.netlify.com → tahtirevan)

| Ayar | Yeri | Değer |
| --- | --- | --- |
| Görünürlük | Project configuration → General → Visitor access → Edit visibility | **Production: Public** (yeni projeler "Private" başlıyor; açılmazsa herkes Netlify giriş sayfasına düşer, `curl` 401 verir) |
| Rozet | General → Powered by Netlify badge | Kapalı |
| Alan adı | Domain management | Birincil `tahtirevan.com`; `www` otomatik olarak birincile yönlenir; HTTPS Let's Encrypt ile |
| Formlar | Forms | Form detection açık, form adı `acilis-listesi` |
| Form bildirimi | Forms → Form submission notifications | Herhangi bir formdan yeni kayıt gelince → **hi@tahtirevan.com**, konu "Tahtırevan · açılış listesine yeni kayıt" |

Panelde bir ayar değiştirmeden önce kullanıcıya ne yapacağını söyle. Giriş ve şifre her zaman kullanıcıya aittir. Netlify son dönemde bazı menülerin adını ve yerini değiştirdi ("Site" yerine "Project" gibi); bir menüyü bulamazsan sayfanın metnini okuyarak ara.

## "Haber ver" formu (açılış listesi)

- **Yöntem:** Netlify Forms. Ek bir hesap, API anahtarı ya da sunucu fonksiyonu yok. Önce Resend ve bir Netlify fonksiyonuyla kurulmuştu, ama kullanıcının hesap açıp anahtar girmesi gerektiği için bu yönteme geçildi.
- **HTML:** `<form name="acilis-listesi" data-netlify="true" netlify-honeypot="website">`. İçinde gizli `form-name` ve `lang` alanları var. Formun adı değişirse gizli `form-name` alanının değeri de aynı şekilde değişmeli; Netlify'daki liste de yeni adla sıfırdan başlar.
- **JS:** Form alanlarını `application/x-www-form-urlencoded` olarak `/` adresine POST eder. Başarılı olunca formun yerine teşekkür mesajı çıkar.
- **Bot koruması:** Gizli `website` alanı doluysa ya da form sayfa açıldıktan sonraki 2 saniye içinde gönderilirse istek hiç gönderilmez, yine de teşekkür mesajı görünür. Netlify'ın kendi spam filtresi de bunun üstüne çalışır.
- **Kayıtlar:** Netlify → Forms → `acilis-listesi`. Açılış duyurusu için **Download as CSV** ile indirilir.
- Formu canlıda test etmek gerçek bir kayıt ve bildirim e-postası oluşturur. Testten önce kullanıcıya haber ver, `deneme@example.com` gibi bir adres kullan ve sonra kaydı silebileceğini söyle.
- Bildirim e-postası gelmiyorsa önce Spam klasörüne bakılmalı.
- Sayfadaki not "E-posta adresinizi yalnızca açılış duyurusu için kullanırız" diyor. Listeyi başka bir amaçla kullanma önerisinde bulunma.

## Alan adı ve DNS

- **Kayıt firması:** tahtirevan.com Google Workspace üzerinden alındı; alan adı ve DNS **Squarespace Domains**'de yönetiliyor. Ad sunucuları: `nsa1/nsa2.squarespacedns.com`.
- **DNS sayfası:** https://account.squarespace.com/domains/managed/tahtirevan.com/dns/dns-settings (Squarespace'e girişi kullanıcı yapar).

Şu anki kayıtlar:

| Grup | Tür | Ad | Veri | Durum |
| --- | --- | --- | --- | --- |
| Özel kayıtlar | A | @ | `75.2.60.5` | Netlify |
| Özel kayıtlar | CNAME | www | `tahtirevan.netlify.app` | Netlify |
| Özel kayıtlar | MX | @ | `smtp.google.com` (öncelik 1) | **Gmail, dokunma** |
| Özel kayıtlar | TXT | @ | `v=spf1 include:_spf.google.com ~all` | **Gmail, dokunma** |
| Özel kayıtlar | TXT | google._domainkey | `v=DKIM1; …` | **Gmail, dokunma** |
| Squarespace Domain Connect | CNAME | _domainconnect | … | Zararsız, kalsın |

- "Squarespace Varsayılan Ayarları" ön ayarı silindi. Bu ön ayarda 4 A kaydı (198.185.159.144/145, 198.49.23.144/145), `www → ext-sq.squarespace.com` ve bir HTTPS kaydı vardı; hepsi alan adını Squarespace'in park sayfasına gönderiyordu. **Ön ayarı geri ekleme.** Eklenirse site yeniden Squarespace sayfasına döner.
- Squarespace formunda "Kayıt ekleyin" düğmesi bazen ilk tıklamada açılmıyor; ikinci tıklama gerekebiliyor.
- Silinen kayıtların TTL'si (önbellekte tutulma süresi) 4 saatti.

### "tahtirevan.com eski / Squarespace sayfası görünüyor"

Squarespace'in "Şu anda yapım aşamasındayız" yazılı manzara fotoğraflı sayfası görünüyorsa sorun büyük ihtimalle önbellektir. Kullanıcının bilgisayarı ya da kullandığı DNS servisi (ör. Google 8.8.8.8) eski Squarespace kaydını en fazla TTL süresi kadar, yani 4 saat hatırlayabilir.

1. **Asıl kaynağı kontrol et:** `nslookup -type=A tahtirevan.com nsa1.squarespacedns.com`. Yanıt `75.2.60.5` ise kayıt doğrudur; sorun yalnızca önbellektedir.
2. **Başka sunuculara sor:** Aynı sorguyu `1.1.1.1`, `8.8.8.8` ve `9.9.9.9` ile yap. Bazıları bir süre eski adresi verebilir.
3. **Kullanıcıya önerilecek çözümler:**
   - Windows'ta `ipconfig /flushdns` komutunu çalıştırmak.
   - Chrome'da `chrome://net-internals/#dns` sayfasında **Clear host cache** düğmesine basmak.
   - https://developers.google.com/speed/public-dns/cache adresinde `tahtirevan.com` için Google'ın önbelleğini temizlemek; tür olarak A ve HTTPS seçilir.
   - Siteyi gizli pencerede ya da Wi-Fi'ı kapatıp telefonun mobil verisiyle açmak.
   - En kötü ihtimalle birkaç saat beklemek.
4. Asıl kaynak hâlâ `198.x` adresleri veriyorsa ön ayar geri gelmiş demektir. Squarespace DNS sayfasını aç ve kayıtları yeniden kontrol et.

### HTTPS

Sertifikayı Netlify kendisi kurar ve yeniler. DNS doğru adresi gösterdikten sonra **Domain management → HTTPS → Verify DNS configuration** düğmesine basılır; sertifika birkaç dakika içinde gelir (ilk kurulumda yaklaşık 8,5 dakika sürdü). Sertifika gelince `http://` ve `www` adresleri `https://tahtirevan.com`'a 301 ile yönlenir.

## Görselleri yeniden üretmek

Kaynak dosyalar ana sitenin klasöründe: kumaşlar `site/public/fabrics/<ad>.jpg`. **Sayfada ve paylaşım görselinde koltuk yok** (23 Kasım 2026, kullanıcı istedi; koltuğu geri ekleme). Görseller bu skill'in içindeki betikle üretilir; betik `site/node_modules/sharp` paketini kullanır, bu yüzden önce `site` klasöründe `npm install` yapılmış olmalı.

```bash
node ".claude/skills/coming-soon/scripts/make-assets.cjs" "C:\Users\Beytullah KALAY\OneDrive\Desktop\tahtirevan"
```

- Betik `coming-soon/assets/` içindeki dosyaları **aynı adlarla** yeniden yazar.
- Netlify `/assets/*` dosyalarını 7 gün önbellekte tutar (`Cache-Control max-age=604800`). Görsel değişirse ya dosyaya yeni bir ad ver ve `index.html` içindeki yolu güncelle, ya da adresin sonuna `?v=2` gibi bir ek koy.
- Kumaş listesi betikteki `ids` dizisinde. Sitede olmayan 7 katalog kumaşı (Serengeti, Savana, Zebrano, Montana, Rodeo, Celeste, Floresta) brief gereği burada da yok.
- Paylaşım görseli `og-2.jpg`: ortada "Bir taht, tek bir kişi için." / "A throne, made for one.", altında 7 kumaş dairesi. Değişirse betikteki `OG_NAME`i artır ve `index.html`deki `og:image` yolunu güncelle.

## Bilinen küçük konular

- `/olmayan-sayfa` gibi var olmayan adresler, `netlify.toml` içindeki `/* → /` kuralına rağmen Netlify'ın kendi 404 sayfasını gösteriyor. Düzeltmek için `coming-soon/404.html` adında markaya uygun bir sayfa eklenebilir ya da yönlendirme kuralına `force = true` verilebilir; ancak `force` kullanılırsa `/` adresine yapılan form gönderimini (POST) bozmadığı kontrol edilmeli.
- Paylaşım (Open Graph) etiketlerindeki adresler `https://tahtirevan.com/…` olarak sabit yazılı.

## Tam siteye geçiş (YAPILDI, 23.11.2026)

**tahtirevan.com artık tam siteyi (`site/`) gösteriyor: aynı Netlify projesi, panelde "Yakında" modu.** `coming-soon/` klasörü artık yayında değil. Oradan `npx netlify-cli deploy --prod` çalıştırma: tam sitenin üzerine yazar. Eski `acilis-listesi` kayıtları `site/backups/acilis-listesi-netlify.csv` dosyasında. Ayrıntı: admin-panel skill'i → Netlify.

### Eski plan (arşiv)

Tam sitenin kendi "Yakında" modu var: admin paneli → Ayarlar → **Site durumu** (ayrıntı: `admin-panel` skill'i). Aynı tasarımı `site/app/(durum)/` altında gösterir; "Haber ver" kayıtları Netlify'a değil panelin **Açılış listesi**ne gider. Böylece tam site, alan adına "Yakında" modunda taşınıp hazır olunca panelden açılabilir. Bu durumda Netlify'daki eski listeyi CSV olarak indirip saklamayı unutma.

1. **Barındırma seçimi (karar verildi, 23.11.2026):** Tam site aynı Netlify projesinde çalışacak; veritabanı Netlify Database, dosyalar Netlify Blobs, formlar Netlify Forms. Kod hazır; ayrıntı `admin-panel` skill'i → "Yayına alırken (Netlify)". Proje Git'ten (GitHub, Base directory `site`) derlenince bu sayfanın elle yayını biter; "Yakında" görünümünü artık tam sitenin panelindeki **Site durumu** verir.
2. **Hazırlık:** Yeni barındırmada site `*.up.railway.app` gibi geçici bir adreste test edilir.
3. **Netlify'dan ayırma:** Netlify'da Domain management bölümünden `tahtirevan.com` ve `www` kaldırılır.
4. **DNS değişikliği:** Squarespace'te yalnızca **A @** ve **CNAME www** kayıtları yeni barındırmanın verdiği değerlerle değiştirilir. Gmail kayıtlarına (MX ve TXT) yine dokunulmaz.
5. **Açılış listesi:** Açılış duyurusu için listeyi Netlify Forms'tan CSV olarak indir. Netlify projesi silinmeden önce bu listenin yedeği mutlaka alınmış olmalı.
