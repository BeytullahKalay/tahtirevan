import type { Collection, Fabric } from "./catalog";
import { collectionHref, type Lang } from "./i18n";
import type { RoadStop } from "@/components/RoadStops";

/**
 * Yayındaki koleksiyonları yolun duraklarına çevirir (ana sayfa ve Hikâye).
 * Kemerin içine, koleksiyonun kendi görseli olmadığı için site ayarlarındaki
 * "açılış kumaşları" sırayla konur.
 */
export function roadStops(
  lang: Lang,
  collections: Collection[],
  getFabric: (id: string) => Fabric,
  heroFabricIds: string[],
  words: { stop: string; start: string },
): RoadStop[] {
  return collections.map((col, i) => {
    const fabricId = heroFabricIds.length ? heroFabricIds[i % heroFabricIds.length] : "";
    return {
      id: col.id,
      kicker: `${words.stop} ${String(i + 1).padStart(2, "0")} · ${col.stop[lang] || (i === 0 ? words.start : "")}`,
      name: col.name[lang],
      line: col.line[lang] || undefined,
      href: collectionHref(lang, col),
      tile: fabricId ? getFabric(fabricId).tile : undefined,
    };
  });
}
