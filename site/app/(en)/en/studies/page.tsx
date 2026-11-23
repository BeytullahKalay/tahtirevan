import { StudiesView } from "@/components/views/StudiesView";
import { metaFor } from "@/lib/seo";

export const metadata = metaFor("en", "studies");

export default function Page() {
  return <StudiesView lang="en" />;
}
