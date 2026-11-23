/**
 * Etüt kartının altındaki görünür "incele" çağrısı. Kartın tamamı bağlantı; bu satır bunu
 * telefonda da (üzerine gelme yokken) belli eder. Kart üzerine gelinince ok sağa kayar.
 */
export function StudyCta({ text }: { text: string }) {
  return (
    <span className="label mt-6 inline-flex items-center gap-3 border-b border-altin/40 pb-1.5 !text-altin transition-colors duration-500 group-hover:border-altin">
      {text}
      <span aria-hidden="true" className="inline-block transition-transform duration-500 group-hover:translate-x-1.5">
        →
      </span>
    </span>
  );
}
