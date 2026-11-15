import { HomeView } from "@/components/views/HomeView";
import { metaFor } from "@/lib/seo";

export const metadata = metaFor("en", "home");

export default function Page() {
  return <HomeView lang="en" />;
}
