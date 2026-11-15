import { BespokeView } from "@/components/views/BespokeView";
import { metaFor } from "@/lib/seo";

export const metadata = metaFor("en", "bespoke");

export default function Page() {
  return <BespokeView lang="en" />;
}
