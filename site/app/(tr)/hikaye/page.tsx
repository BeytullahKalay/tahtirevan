import { StoryView } from "@/components/views/StoryView";
import { metaFor } from "@/lib/seo";

export const metadata = metaFor("tr", "story");

export default function Page() {
  return <StoryView lang="tr" />;
}
