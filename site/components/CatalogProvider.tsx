"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { withHelpers, type CatalogData } from "@/lib/catalog";

const Ctx = createContext<CatalogData | null>(null);

/** Sunucuda yüklenen kataloğu tarayıcıdaki bileşenlere aktarır (SiteShell içinde bir kez kurulur). */
export function CatalogProvider({ data, children }: { data: CatalogData; children: ReactNode }) {
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
}

/** Tarayıcı bileşenlerinde katalog verisi ve yardımcıları. */
export function useCatalog() {
  const data = useContext(Ctx);
  if (!data) throw new Error("useCatalog: CatalogProvider bulunamadı");
  return useMemo(() => withHelpers(data), [data]);
}
