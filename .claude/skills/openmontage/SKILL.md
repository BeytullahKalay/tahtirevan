---
name: openmontage
description: OpenMontage video atölyesi köprüsü (C:\Users\Beytullah KALAY\OpenMontage). Kullanıcı "OpenMontage ile", "/reel", ya da sıfırdan bir tanıtım/explainer/sinematik video, altyazılı kurgu, kliplerden otomatik montaj, Remotion/HyperFrames animasyonu, seslendirme (TTS) ve müzikli bir video üretmek istediğinde kullan. Elimizdeki klipleri ffmpeg ile birleştirip kesmek gibi basit montaj işleri için reels-montaj skill'i yeterlidir.
---

# OpenMontage (video atölyesi)

OpenMontage tek bir skill değil, kendi skill'leri (93 adet), Python araçları ve Remotion kompozitörü olan ayrı bir çalışma alanı. Skill'leri tahtirevan'a kopyalamadık; göreli yollara (`tools/`, `pipeline_defs/`, `skills/`) bağlı oldukları için kendi klasörlerinde çalışırlar.

- Konum: `C:\Users\Beytullah KALAY\OpenMontage` (OneDrive dışında; `.venv` ve `node_modules` senkronize olmasın diye)
- Kaynak: https://github.com/calesthio/OpenMontage (güncellemek için orada `git pull`)
- Ayarlar ve API anahtarları: `OpenMontage\.env` (`.env.example`'dan kopyalandı, anahtarlar boş)

## Nasıl çalışılır

1. **Önce `C:\Users\Beytullah KALAY\OpenMontage\AGENT_GUIDE.md` dosyasını oku.** Yönlendirme kuralları orada ("Rule Zero"): her üretim `pipeline_defs/*.yaml` içindeki bir pipeline'dan geçer, her aşamadan önce `skills/pipelines/<pipeline>/<aşama>-director.md` okunur, bir araç çağrılmadan önce `.agents/skills/` içindeki ilgili skill okunur.
2. Komutları OpenMontage klasöründe, sanal ortamı PATH'e ekleyerek çalıştır: `cd "C:/Users/Beytullah KALAY/OpenMontage" && PATH="$PWD/.venv/Scripts:$PATH" .venv/Scripts/python ...`. Sistem `python` komutu Store kısayoludur, çalışmaz. PATH eklenmezse `piper` gibi komut satırı araçları "unavailable" görünür.
3. Tahtırevan malzemesini (koltuk görselleri, kumaşlar, logo, AI klipler) `pazarlama-video/` altından **kopyalayarak** kullan; OpenMontage çıktılarını bitince `pazarlama-video/reels-N/` altına geri al.
4. Pipeline seçimi: tanıtım/ürün için `cinematic` ya da `hybrid`, mevcut kliplerden montaj için `documentary-montage` ya da `clip-factory`, kod animasyonu için `animated-explainer`. Emin değilsen kullanıcıya sor.

## Tahtırevan'a özgü kurallar

- Ücretli üretim (fal, Kling, Veo, Sora, ElevenLabs vb.) başlatmadan önce maliyeti söyleyip onay al. Mevcut AI video planı için [[ai-video-plan]] hafızasına bak (fal üzerinden Kling 3.0 Pro).
- Koltuğun fiziksel ürünü henüz yok; görseller AI + gerçek kumaş. Metinlerde "el oyması ceviz" gibi iddialar ürün fotoğrafıyla çelişiyor; video metnine eklemeden önce sor.
- Kullanıcı Türkçe yazıyor ve teknik konularda yeni: seçenek sunarken kavramı sade bir örnekle anlat.

## Kurulum durumu (2026-11-17)

- Remotion kompozitörü: `remotion-composer/` içinde `npm install` yapıldı. Node 24.14.1 kurulu, paket ^24.22.1 istiyor; yalnızca uyarı veriyor. Render sorun çıkarırsa Node'u güncelle.
- ffmpeg 9 kurulu.
- Python 3.11.9 winget ile kullanıcıya kuruldu: `C:\Users\Beytullah KALAY\AppData\Local\Programs\Python\Python311\python.exe`. OpenMontage'ın `.venv` ortamı bununla oluşturuldu; `requirements.txt` ve `piper-tts` kuruldu, HyperFrames (0.9.59) npx önbelleğinde.
- Araç kaydı: 37 araç hazır (kurgu, kesme, renk, altyazı, ses miksi, Remotion/HyperFrames render, Piper TTS, Pixabay müzik). Geri kalanların çoğu `.env` içinde API anahtarı bekliyor; fal araçları için `FAL_KEY` gerekli.
- Piper için ses modeli indirilmedi. Türkçe seslendirme gerekirse `tr_TR` modeli indirilmeli (`python -m piper.download_voices`).
