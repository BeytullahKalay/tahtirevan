type Props = { size?: number; className?: string; title?: string };

/** İnce bir daire içinde TR. Favicon, mühür ve giriş animasyonunda kullanılır. */
export function Monogram({ size = 40, className, title }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" />
      <text
        x="50"
        y="51"
        textAnchor="middle"
        dominantBaseline="central"
        fill="currentColor"
        style={{ fontFamily: "var(--font-serif)", fontSize: 34, letterSpacing: "0.06em", fontWeight: 400 }}
      >
        TR
      </text>
    </svg>
  );
}
