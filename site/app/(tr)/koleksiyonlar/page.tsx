import { CollectionsView } from "@/components/views/CollectionsView";
import { metaFor } from "@/lib/seo";

export const metadata = metaFor("tr", "collections");

export default function Page() {
  return <CollectionsView lang="tr" />;
}
