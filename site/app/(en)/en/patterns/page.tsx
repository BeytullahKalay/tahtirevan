import { PatternsView } from "@/components/views/PatternsView";
import { metaFor } from "@/lib/seo";

export const metadata = metaFor("en", "patterns");

export default function Page() {
  return <PatternsView lang="en" />;
}
