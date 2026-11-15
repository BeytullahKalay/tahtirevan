/**
 * Tahtırevan amblemi: tepelikli kemer, dilimli saçak ve püskül, Mirza kumaşından
 * buta dizili kakma gövde bandı, taşıma sırığı. İçerisi bilerek boş: "her taht, sahibini bekler".
 * Durağan kopyaları: public/brand/emblem.svg (ayrıntılı) ve public/brand/mark.svg (sade).
 * Çizimi değiştirirsen o dosyaları da güncelle.
 */

type Props = { className?: string; title?: string };

const a11y = (title?: string) =>
  title ? { role: "img" as const, "aria-label": title } : { "aria-hidden": true as const };

// Yatay buta; göbeği solda, kuyruğu sağa ve yukarı kıvrılır. Sağ yarıda aynalanır.
const BUTA =
  "M-1.5 4C-4.5 4 -5.2 1 -4.6 -1C-4 -3 -1.8 -4.2 0.8 -3.6C2.8 -3.2 4 -2.4 5.6 -3.6C5.2 -1.2 3.6 0.2 2 1.6C1 2.8 0 4 -1.5 4Z" +
  "M-1.6 2.2C-3 2.2 -3.2 0.8 -2.8 -0.2C-2.3 -1.4 -0.9 -1.8 0.4 -1.4";
const BUTAS = [
  [68, 0.92],
  [79, 0.92],
  [90, 0.92],
  [110, -0.92],
  [121, -0.92],
  [132, -0.92],
] as const;

/** Ayrıntılı amblem (200×164). Büyük kullanımlar için: açılış, mühür, alt bilgi. */
export function Emblem({ className, title }: Props) {
  return (
    <svg
      viewBox="0 0 200 164"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...a11y(title)}
    >
      {/* tepelik */}
      <path d="M100 2.5V8.5" strokeWidth="1.4" />
      <path d="M100 8.5C103.6 12.6 104.4 16.4 100 21C95.6 16.4 96.4 12.6 100 8.5Z" strokeWidth="1.4" />
      <path d="M100 12.8C101.4 14.6 101.5 16.2 100 17.8C98.5 16.2 98.6 14.6 100 12.8Z" fill="currentColor" stroke="none" />
      <path d="M95.5 21H104.5M97 24H103" strokeWidth="1.4" />
      {/* kemer ve ayaklar */}
      <path
        d="M58 158V80C58 61 69 53 82 45.5C91 40.3 97 35.5 100 27C103 35.5 109 40.3 118 45.5C131 53 142 61 142 80V158"
        strokeWidth="2.2"
      />
      {/* dilimli saçak */}
      <path
        d="M62 92V80C62 76.6 62.6 73.6 63.8 71A5.6 5.6 0 0 1 70.4 64A6 6 0 0 1 78.6 56.4A6 6 0 0 1 87.2 50A5.6 5.6 0 0 1 95 44.4C97.1 42.6 98.8 40.6 100 38.2C101.2 40.6 102.9 42.6 105 44.4A5.6 5.6 0 0 1 112.8 50A6 6 0 0 1 121.4 56.4A6 6 0 0 1 129.6 64A5.6 5.6 0 0 1 136.2 71C137.4 73.6 138 76.6 138 80V92"
        strokeWidth="1.3"
      />
      {/* püskül */}
      <path d="M100 38.2V47" strokeWidth="1.1" />
      <circle cx="100" cy="49" r="2" strokeWidth="1.1" />
      <path d="M98 51.2H102L104.2 63H95.8Z" strokeWidth="1.1" />
      <path d="M98.6 54.5V61.8M100 54.5V61.8M101.4 54.5V61.8" strokeWidth="0.7" />
      {/* kakma gövde bandı */}
      <path d="M58 126H142M58 145H142" strokeWidth="1.6" />
      <path d="M61 129.4H139M61 141.6H139" strokeWidth="0.7" />
      <g strokeWidth="0.9">
        {BUTAS.map(([x, s]) => (
          <path key={x} d={BUTA} transform={`translate(${x} 135.8) scale(${s} 0.92)`} />
        ))}
        <path d="M100 131.6L103.9 135.5L100 139.4L96.1 135.5Z" />
        <circle cx="100" cy="135.5" r="0.9" fill="currentColor" stroke="none" />
      </g>
      {/* taşıma sırığı */}
      <path d="M22 150H178" strokeWidth="3" />
      <path d="M19 145.6V154.4M181 145.6V154.4" strokeWidth="2.2" />
      <circle cx="12.5" cy="150" r="4.2" strokeWidth="1.6" />
      <circle cx="187.5" cy="150" r="4.2" strokeWidth="1.6" />
      <circle cx="5.4" cy="150" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="194.6" cy="150" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Sade simge (64×64): kemer, tepelik, gövde çizgisi ve sırık. Üst menü ve favicon boyutları için. */
export function Mark({ className, title }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...a11y(title)}
    >
      <path d="M32 3.5C34.2 6 34.4 8.2 32 10.6C29.6 8.2 29.8 6 32 3.5Z" fill="currentColor" stroke="none" />
      <path
        d="M19.5 57V31C19.5 24.6 23.4 21.6 27.6 18.8C30 17.2 31.4 15.4 32 12.8C32.6 15.4 34 17.2 36.4 18.8C40.6 21.6 44.5 24.6 44.5 31V57"
        strokeWidth="2.6"
      />
      <path d="M19.5 44H44.5" strokeWidth="2" />
      <path d="M10 50.5H54" strokeWidth="2.8" />
      <circle cx="6.6" cy="50.5" r="2.4" fill="currentColor" stroke="none" />
      <circle cx="57.4" cy="50.5" r="2.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
