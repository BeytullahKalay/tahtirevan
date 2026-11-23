# Kartvizit · ChatGPT promptları

İki sürüm var: **A · püsküllü** (özel kart: mimarla ilk görüşme, numune kutusu) ve **B · püskülsüz** (günlük kart).

**En kolay yol:** beğendiğin görseli ChatGPT'ye ekleyip aşağıdaki kısa düzeltme promptlarını kullan. Böylece aynı kart korunur.
**Sıfırdan üretmek istersen:** `logos/fancy-texted.png` dosyasını ekleyip uzun promptları kullan.

Telefon ve e-posta satırlarını kendi bilgilerinle değiştir.

---

## Kısa yol · beğenilen görsel üzerinden

### A · Püsküllü

```
Keep this image exactly the same: same cards, logo, layout, light, desk, velvet and brass stamp. Only two changes:
1. Make the small gold-foil square seal in the bottom-right corner of the back card about twice as large, still subtle.
2. Replace the phone placeholder with "+90 5XX XXX XX XX" and the email with "beytullah@tahtirevan.com", spelled exactly.
```

### B · Püskülsüz

```
Keep this image exactly the same: same cards, logo, layout, light, desk, velvet and brass stamp. Only these changes:
1. Remove the tassel and the punched hole completely; the back card's top edge is clean and uncut.
2. Make the small gold-foil square seal in the bottom-right corner of the back card about twice as large, still subtle.
3. Replace the phone placeholder with "+90 5XX XXX XX XX" and the email with "beytullah@tahtirevan.com", spelled exactly.
```

---

## Uzun yol · sıfırdan

Ortak kısım iki sürümde aynı; yalnızca **TASSEL** satırı değişir.

### A · Püsküllü

```
Photorealistic product mockup of a luxury business card for TAHTIREVAN, a bespoke upholstered-furniture house. Use the attached logo exactly as given: do not redraw, simplify or alter the emblem.

THE CARD
Standard 85 × 55 mm, horizontal. Extra-thick 800 gsm cotton paper with a soft felt texture. All four edges painted deep oxblood (#6E1F24). Show the front and the back side by side, slightly overlapping, lying on a dark walnut desk. Next to them: a folded corner of deep printed velvet in warm jewel tones and a brass wax-seal stamp whose face carries the same emblem. Soft window light from the upper left, shallow depth of field, warm, quiet, editorial luxury mood.

FRONT
Warm near-black background (#14110F). The emblem from the attached logo, centered in the upper two-thirds, hot-stamped in antique gold foil (#B08D57), satin finish, not mirror-shiny. Below it the word TAHTIREVAN in widely letter-spaced serif capitals (Cormorant Garamond style), ivory (#E9E1D3). Nothing else on the front.

BACK
Same warm near-black background. Left-aligned text block with generous margins:
  Beytullah Kalay                (elegant serif, ivory, the largest text)
  KURUCU · TASARIM DİREKTÖRÜ     (small, widely spaced capitals, clean sans-serif like Manrope, gold)
  a short thin gold hairline
  +90 5XX XXX XX XX
  beytullah@tahtirevan.com
  tahtirevan.com
Contact lines in small ivory sans-serif.
Along the right edge: a narrow vertical band of the paisley (buta) border from the logo, blind-embossed with no ink, so it reads like fine embroidery stitching pressed into the paper.
Bottom-right corner: a small gold-foil square seal mark, like a brass maker's stamp, clearly visible but subtle.

TASSEL
A small punched hole at the top center of the back card, with a short oxblood silk tassel threaded through it on a knotted cord.

RULES
Spell every word exactly as written above, including the Turkish letters İ and Ö. No extra text, no slogan, no QR code, no icons. Matte paper, no glossy plastic look. No furniture in the image.
```

### B · Püskülsüz

Yukarıdaki promptun aynısı; yalnızca **TASSEL** bölümünü şununla değiştir:

```
TASSEL
No tassel and no punched hole. The card edges are clean and uncut; the oxblood painted edge is the only accent.
```

---

## Sonra

- Yazı bozuk çıkarsa: "Keep everything the same, only fix the spelling of …" diye tek düzeltme iste.
- İngilizce ünvan istersen: `KURUCU · TASARIM DİREKTÖRÜ` yerine `FOUNDER · CREATIVE DIRECTOR`.
- Bu bir tanıtım görseli, baskı dosyası değil. Baskıda yazılar ve logo vektör olarak yeniden dizilmeli (logo SVG'si `site/public/brand/emblem.svg`).
