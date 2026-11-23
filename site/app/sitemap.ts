import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog.server";
import { ROUTES, collectionHref, fabricHref, pieceHref, type RouteKey } from "@/lib/i18n";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { collections, pieces, fabrics } = await getCatalog();
  const entry = (tr: string, en: string, priority = 0.7): MetadataRoute.Sitemap => {
    const alternates = { languages: { tr: SITE_URL + tr, en: SITE_URL + en } };
    return [
      { url: SITE_URL + tr, alternates, priority },
      { url: SITE_URL + en, alternates, priority },
    ];
  };

  const statics = (Object.keys(ROUTES) as RouteKey[]).flatMap((k) =>
    entry(ROUTES[k].tr, ROUTES[k].en, k === "home" ? 1 : ["privacy", "cookies"].includes(k) ? 0.3 : 0.8),
  );
  const cols = collections.flatMap((c) => entry(collectionHref("tr", c), collectionHref("en", c), 0.8));
  const items = pieces.flatMap((p) => entry(pieceHref("tr", p), pieceHref("en", p), 0.9));

  const fabricPages = fabrics.flatMap((f) => entry(fabricHref("tr", f.id), fabricHref("en", f.id), 0.8));

  return [...statics, ...cols, ...items, ...fabricPages];
}
