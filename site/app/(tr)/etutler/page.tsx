import { StudiesView } from "@/components/views/StudiesView";
import { metaFor } from "@/lib/seo";

export const metadata = metaFor("tr", "studies");

export default function Page() {
  return <StudiesView lang="tr" />;
}
