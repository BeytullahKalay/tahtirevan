import type { Lang } from "./i18n";

const TR = ["sıfır", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz", "on"];
const TR_TENS = ["", "on", "yirmi", "otuz", "kırk", "elli"];
const EN = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];

/**
 * Metinlerdeki sayılar yazıyla ("on bir kumaş", "eleven fabrics"). Katalogdaki adetten üretilir;
 * panelden kumaş ya da kod eklenince metin kendiliğinden doğru kalır. Büyük sayılarda rakam.
 */
export function countWord(n: number, lang: Lang, capital = false) {
  let w: string;
  if (lang === "tr") {
    if (n <= 10) w = TR[n];
    else if (n < 60) w = `${TR_TENS[Math.floor(n / 10)]}${n % 10 ? " " + TR[n % 10] : ""}`;
    else w = String(n);
  } else {
    w = n <= 20 ? EN[n] : String(n);
  }
  return capital ? w.charAt(0).toLocaleUpperCase(lang) + w.slice(1) : w;
}
