import { PatternsView } from "@/components/views/PatternsView";
import { metaFor } from "@/lib/seo";

export const metadata = metaFor("tr", "patterns");

export default function Page() {
  return <PatternsView lang="tr" />;
}
