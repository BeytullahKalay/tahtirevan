import type { MetadataRoute } from "next";
import { collections, pieces } from "@/lib/content";
import { ROUTES, collectionHref, pieceHref, type RouteKey } from "@/lib/i18n";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
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

  return [...statics, ...cols, ...items];
}
