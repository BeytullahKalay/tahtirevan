import { CollectionsView } from "@/components/views/CollectionsView";
import { metaFor } from "@/lib/seo";

export const metadata = metaFor("en", "collections");

export default function Page() {
  return <CollectionsView lang="en" />;
}
