import { HomeView } from "@/components/views/HomeView";
import { metaFor } from "@/lib/seo";

export const metadata = metaFor("tr", "home");

export default function Page() {
  return <HomeView lang="tr" />;
}
