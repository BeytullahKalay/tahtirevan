---
name: admin-panel
description: Tahtırevan admin paneli (Payload CMS, /admin) rehberi. Kullanıcı panelle ilgili bir şey sorduğunda ya da yaptırdığında kullan; siteyi "Yakında" ya da "Bakımdayız" moduna alma (Site durumu, proxy.ts, /durum sayfası, açılış listesi), panele giriş, ilk kullanıcı/şifre, yeni kullanıcı ekleme, parça/kumaş/koleksiyon/desen kodu ekleme veya düzenleme, taslak-yayınla, görsel veya 3B model (GLB) yükleme, site ayarları, TR/EN metinler, veritabanı (data/tahtirevan.db), media klasörü, yedekleme (npm run backup), içerik aktarma (npm run seed), panel koleksiyonlarına alan ekleme (payload/ klasörü, payload-types.ts) ya da siteyi panelle birlikte yayına alma konuları buna girer.
---

# Tahtırevan admin paneli

Panel, sitenin içinde çalışan bir Payload CMS (sürüm 3.93). Ayrı bir program değil: site çalışıyorsa panel de çalışır.

- Adres: **http://localhost:3100/admin** (yerel sunucu `.claude/launch.json` → `tahtirevan`, port 3100)
- Ayar dosyası: `site/payload.config.ts`
- Koleksiyon tanımları: `site/payload/collections/*.ts`, `site/payload/globals/siteSettings.ts`, ortak yardımcılar `site/payload/shared.ts`
- Sitenin veriyi okuduğu yer: `site/lib/catalog.server.ts` (yalnızca **yayındaki** kayıtlar)

Kullanıcı Türkçe yazıyor ve teknik konularda yeni. Adımları sade anlat, gerekirse küçük bir örnek ver.

## İlk giriş

1. Siteyi çalıştır, `/admin` adresini aç.
2. Hiç kullanıcı yoksa "create first user" formu çıkar. E-posta, şifre ve ad girilir.
3. Formda rol "Editör" görünse de **ilk hesap her zaman Yönetici olur** (`users.ts` içindeki kanca).
4. **Şifreyi kullanıcı kendisi girer.** Claude kullanıcının yerine hesap açmaz, şifre yazmaz.

Şifre unutulursa panelin "Forgot password" bağlantısı gerçek bir e-posta göndermez, çünkü panelde e-posta ayarı yok (en fazla sunucu konsoluna yazar). Çözüm: başka bir yönetici hesabıyla kullanıcının şifresini değiştirmek. Tek yönetici kendisiyse, ne yapılacağını kullanıcıya sor; veritabanına doğrudan müdahale etmeden önce mutlaka yedek al.

Oturum 7 gün açık kalır. 8 yanlış denemede hesap 15 dakika kilitlenir.

## Roller

| Rol | Yapabildikleri |
| --- | --- |
| Yönetici | Her şey, kullanıcı ekleme/silme, rol değiştirme |
| Editör | Tüm içeriği düzenler; kullanıcı ekleyemez, rolünü değiştiremez |

## Paneldeki bölümler

| Grup | Koleksiyon | Ne için |
| --- | --- | --- |
| Katalog | Parçalar (`pieces`) | Koltuklar ve diğer ürünler, kişiselleştirme seçenekleri, isteğe bağlı 3B model |
| Katalog | Kumaşlar (`fabrics`) | Kumaş adı, açıklama, renk notları, ölçek, kadife rengi, görsel |
| Katalog | Koleksiyonlar (`piece-collections`) | Parçaların gruplandığı koleksiyonlar |
| Katalog | Desen kodları (`pattern-codes`) | Bahçe, Fauna, Süsleme, Rüya gibi desen aileleri |
| Seçenekler | Parça türleri, Ahşaplar, Kaplamalar, Ölçüler | Kişiselleştirmede sunulan seçenek listeleri |
| Medya | Kumaş görselleri (`fabric-images`) | Düz kumaş görseli; yükleyince 3B doku (1024), numune (256) ve şerit (440×575) WebP sürümleri **kendiliğinden** üretilir |
| Medya | Fotoğraflar (`media`) | Ürün fotoğrafları; portre için şeffaf PNG en iyisi |
| Medya | 3B modeller (`models`) | Yalnızca `.glb`. Fotoğraftan yapay zekâyla üretilmiş ham dosya olduğu gibi yüklenir; sırt kumaşı / oturak kadifesi / metal **kendiliğinden** ayrılır (bkz. "3B modeller") |
| Ayarlar | Site durumu (global `site-status`) | Site açık / "Yakında" / "Bakımdayız"; iki sayfanın metinleri, açılış tarihi, tahmini dönüş, iletişim e-postası |
| Ayarlar | Açılış listesi (`signups`) | "Yakında" sayfasındaki "Haber ver" formundan gelen e-postalar; CSV: `/api/signups/csv` |
| Ayarlar | Site ayarları (global) | Ana sayfa açılışı (en fazla 4 kumaş), kumaş stüdyosundaki 3B model, sayaçtaki 3 sayı |
| Ayarlar | Kullanıcılar | Panel hesapları |

## 3B modeller

Kullanıcının yolu (kod gerekmez):
1. Koltuk fotoğrafından ücretsiz bir araçla (Hugging Face'te TRELLIS ya da Hunyuan3D) `.glb` üretir. Ticari kullanım için TRELLIS (MIT lisansı) daha güvenli.
2. Panel → Medya › **3B modeller** → Create New → dosya, **Gerçek yükseklik (cm)** → Kaydet. (Parçanın "Görsel ve 3B" sekmesinden de doğrudan yüklenebilir.)
3. Sayfadaki **Önizleme** › "Parçalar" görünümünde yeşil = kumaş (sırt), kırmızı = kadife (oturak), sarı = siyah biye (kenar şeridi), gri = metal. Sırtın altı kırmızıysa **Sırtın başladığı yükseklik (%)** küçültülür, oturak yeşilse büyütülür → Kaydet (dosyayı yeniden yüklemek gerekmez).
4. Modeli bağla: ürün sayfası için Parçalar › Görsel ve 3B › 3B model; ana sayfa için Site ayarları › Kumaş stüdyosu › 3B koltuk. Boşsa sitedeki hazır koltuk (`public/models/koltuk-3.glb`) görünür.

Nasıl çalışır (Claude için):
- Hazırlama `payload/chairModel.ts`, kancalar `payload/collections/uploads.ts` (`Models`). Yeni dosya `beforeOperation`'da `req.file.data` değiştirilerek hazırlanır (Payload dosyayı ondan sonra diske yazar). Ham dosya `media/models/kaynak/<dosya adı>` altında saklanır; ayar değişince `beforeChange` buradan yeniden hazırlar ve dosyanın üzerine yazar. Silinince kaynak da silinir.
- Ayrım renge dayanır: desenli (yeşil/altın/mavi tonlar) yüzler ve yüksekliği sınırın üstündekiler kumaş, kırmızı ve altındakiler kadife, nötr/koyu olanlar metal. Kırmızı olmayan oturak ya da desensiz (düz renk) sırt iyi ayrılmaz; "sırt kumaşı bulunamadı" hatası panelde Türkçe çıkar.
- Biye: `buildPiping()` oturağın üst yüzünün (Kadife) ve sırt kumaşının sınır kenarlarını zincirleyip yumuşatır, üstüne 3,5 mm yarıçaplı ince bir boru (`Biye` parçası) koyar; 60 cm'den kısa çizgiler (desen adacıkları) atlanır. Sitede `ChairCanvas` bunu mat siyah giydirir.
- İçinde `Kumas` adlı malzeme olan (tasarımcının hazırladığı) model olduğu gibi bırakılır.
- Sitede adres `?v=<updatedAt>` ile verilir (`lib/catalog.server.ts` → `modelUrl`), yeniden hazırlanan model tarayıcı önbelleğinden gelmez. Model açılamazsa `ChairCanvas` hazır koltuğa döner; her model kadraja sığdırılır.
- Panelde önizleme bileşeni: `payload/components/ModelPreview.tsx` (değişirse `generate:importmap`).
- **`npm run seed` ya da `payload run` sunucu açıkken çalıştırma:** şemayı yeniden uygulamaya çalışıp "index … already exists" hatasıyla duruyor. Test için geçici bir Next route (klasör adı `_` ile başlamasın; Next onları adres saymaz) ya da sunucuyu durdurmak gerekir.

## Site durumu: Yakında / Bakımdayız

- Panel → Ayarlar → **Site durumu** → "Ziyaretçiler ne görsün?" seçilip **Kaydet**. En geç ~5 saniyede geçerli olur.
- Ziyaretçi hangi adresi açarsa açsın aynı adreste durum sayfasını görür (adres çubuğu değişmez). Site açılınca aynı adres gerçek sayfayı gösterir.
- **Panele giriş yapmış kullanıcı** siteyi normal görür; sağ altta "Ziyaretçiler şu an … sayfasını görüyor · Önizle · Ayarı değiştir" notu çıkar. Kullanıcı "site kapalı değil, her şey görünüyor" derse büyük ihtimalle panele girişlidir: gizli pencereden bakmasını söyle.
- Önizleme (giriş gerekmez, site açıkken de çalışır): `/durum?onizle=yakinda`, `/durum?onizle=bakim`; İngilizce için `&lang=en`. Önizlemedeki form kayıt eklemez.
- Boş bırakılan başlık/metin alanlarında hazır metin kullanılır (`app/(durum)/durum/page.tsx` → `DEFAULTS`).
- Bakımda modu **503 + Retry-After: 3600** döner (arama motorları siteyi dizinden düşürmez). Yakında modu 200 döner; ikisi de `noindex`.
- Panel (`/admin`), API (`/api`), görseller ve `robots.txt` hiçbir modda kapanmaz.

Kod: yönlendirme `site/proxy.ts` (Next 16'nın middleware'i), sayfa `site/app/(durum)/` (kendi kök düzeni, `durum.css`), form API'si `site/app/api/acilis-listesi/route.ts`, panel notu `components/StatusNotice.tsx`, ayar `payload/globals/siteStatus.ts`, liste `payload/collections/signups.ts`.

- `proxy.ts` modu kendi sitesinden `/api/globals/site-status` ile okur (5 sn önbellek) ve oturumu `/api/users/me` ile doğrular (60 sn önbellek). Ayar okunamazsa site **açık** kalır.
- Durum sayfasının tasarımı `coming-soon/index.html` ile aynı. Birinde tasarım değişirse diğerine de taşı.
- Test için modu değiştirmen gerekirse önce `npm run backup`, sonunda modu `live`'a geri al ve `deneme@example.com` gibi test kayıtlarını sil. `payload run` ile çalışan betik `site/` içinde olmalı (paket ESM; dışarıdaki dosya CJS derlenip üst seviye `await` hata veriyor).

## Günlük kullanım kuralları

- **Taslak / Yayınla:** Katalog kayıtlarında "Kaydet" taslak olarak saklar, site göstermez. Sitede görünmesi için **"Yayınla"** gerekir. Kullanıcı "değiştirdim ama sitede yok" derse önce bunu kontrol et.
- **Bağlantısı eksik kayıt atlanır:** Bir parçanın kumaşı yayında değilse o parça sitede görünmez (site bozulmasın diye). "Parça kayboldu" şikâyetinde bağlı kumaş/koleksiyonun durumuna bak.
- **İki dil:** Metin alanları TR ve EN ayrı. Üstteki dil seçiciyle "English"e geçilip yazılır. EN boşsa TR gösterilir.
- **Sıralama:** Listelerde sürükle-bırak sitedeki sırayı belirler (`_order`).
- **Silme koruması:** Kullanımdaki bir kayıt (ör. bir parçanın kumaşı) silinemez; panel nerede kullanıldığını yazar. Önce o bağlantıyı değiştir.
- **Değişiklik anında yansır:** Kaydedince `revalidatePath("/", "layout")` çalışır, sunucuyu yeniden başlatmaya gerek yok.
- Her kayıt için son 20 sürüm saklanır; yanlış değişiklik panelin "Versions" sekmesinden geri alınabilir.
- Kumaş açıklaması görselle eşleşmeli (bkz. CLAUDE.md, Soraya/Zafran hatası). Görsel değiştirirken metni de kontrol et.

## Veri nerede, nasıl yedeklenir

Panelin verisi **Git'e girmez** (`site/.gitignore`):

| Ne | Nerede |
| --- | --- |
| Veritabanı (SQLite) | `site/data/tahtirevan.db` |
| Yüklenen dosyalar | `site/media/fabrics`, `site/media/photos`, `site/media/models` |
| Yedekler | `site/backups/<tarih-saat>/` |

```bash
npm --prefix site run backup
```

Yedek klasörünü bilgisayar dışında (bulut, harici disk) da saklamasını hatırlat. Veritabanını silme, taşıma veya toplu değişiklik gibi riskli bir işten önce **önce yedek al**.

İçeriği `site/content/*.json` ve `public/` görsellerinden panele yeniden aktarmak için:

```bash
npm --prefix site run seed
```

Seed tekrar çalıştırılabilir: kayıtları `key` alanıyla bulur ve günceller, çoğaltmaz. Ancak **panelde yapılmış düzenlemelerin üzerine JSON'daki değerleri yazar.** Panel kullanılmaya başlandıktan sonra seed'i çalıştırmadan önce kullanıcıya sor ve yedek al.

## Kod tarafında değişiklik (Claude için)

- Koleksiyona alan eklerken/değiştirirken: `site/payload/collections/*.ts` düzenle → `npm --prefix site run generate:types` ile `payload-types.ts` güncelle → sitede okunacaksa `lib/catalog.server.ts` ve `lib/catalog.ts` tiplerini güncelle → `npx tsc --noEmit`.
- Panelde özel bileşen eklenirse `npm --prefix site run generate:importmap`.
- Etiketler iki dilli yazılır: `L("Türkçe", "English")` (`payload/shared.ts`). Yeni alanlarda da öyle yap ve kısa bir `admin.description` ekle; paneli teknik olmayan biri kullanıyor.
- İçerik koleksiyonları `contentDefaults` kullanır (taslak, sıralama, yenileme, `readPublished`). Yeni içerik koleksiyonunda da kullan.
- `payload.config.ts` veya `next.config.ts` değişince sunucuyu yeniden başlat.
- SQLite şema değişikliği geliştirme modunda kendiliğinden uygulanır (Payload "push"). Alan silmek/yeniden adlandırmak veri kaybettirebilir: önce yedek al.
- `PAYLOAD_SECRET` tanımlı değilse uygulama açılmaz (`site/.env`). Bu değeri hiçbir yere yazdırma, sohbete kopyalama.
- Kumaş görselleri artık panelden yüklenince sürümleri kendiliğinden üretiliyor; CLAUDE.md'deki "sw/tile/tex sürümlerini yeniden üret" kuralı yalnızca `public/fabrics/` altındaki eski, panel dışı dosyalar için geçerli.

## Yayına alırken

- Veri sunucu diskinde bir dosyada (SQLite) ve yüklenen dosyalar `media/` klasöründe. Bu yüzden **kalıcı diski olan** bir sunucu gerekir (VPS veya kalıcı disk/volume veren bir hizmet). Vercel gibi her dağıtımda diski sıfırlayan yerlerde panel değişiklikleri kaybolur; oraya alınacaksa veritabanı ve dosya depolaması değiştirilmeli. Bunu kullanıcıyla konuşmadan seçme.
- Canlıda `PAYLOAD_SECRET` için yeni, uzun, rastgele bir değer kullanılmalı (yereldekinin aynısı değil).
- Yerel veritabanını ve `media/` klasörünü canlıya taşımak için önce `npm run backup`, sonra yedeği sunucuya kopyala.
- Canlıda `/admin` adresi herkese açık bir giriş sayfasıdır; güçlü şifre kullanılmasını hatırlat.
- DNS ayarlarında Google Workspace'in MX/TXT kayıtlarına dokunma (bkz. CLAUDE.md).

## Sorun giderme

| Belirti | Bakılacak yer |
| --- | --- |
| Panelde değiştirdim, sitede yok | Kayıt "Yayınla" ile yayınlandı mı? Bağlı kumaş/koleksiyon yayında mı? |
| `/admin` açılmıyor, "PAYLOAD_SECRET tanımlı değil" | `site/.env` dosyası eksik ya da değer boş |
| "Another next dev server is already running" | Sunucu zaten açık; mevcut olanı kullan (http://localhost:3100) |
| Silme "hâlâ kullanılıyor" hatası veriyor | Hata mesajında yazan kayıtlardaki bağlantıyı değiştir, sonra sil |
| GLB yüklenmiyor / hata veriyor | Uzantı `.glb` mi? Dokusu dosyanın içinde mi? "Sırt kumaşı bulunamadı" ise "Sırtın başladığı yükseklik"i küçült |
| 3B modeli yükledim, sitede yok | Model bir parçaya (Görsel ve 3B) ya da Site ayarları › Kumaş stüdyosu'na bağlandı mı? Parça yayında mı? |
| Yüklenen görsel eski görünüyor | Yeni adla yükle ya da `site/.next/cache/images` klasörünü sil |
