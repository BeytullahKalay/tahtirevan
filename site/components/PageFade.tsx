import type { ReactNode } from "react";

/**
 * Sayfalar arası yumuşak kararma. Saf CSS: JavaScript beklemeden çalışır,
 * template her geçişte yeniden kurulduğu için animasyon her sayfada tekrar oynar.
 */
export function PageFade({ children }: { children: ReactNode }) {
  return <div className="page-fade">{children}</div>;
}
