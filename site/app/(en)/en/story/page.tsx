import { StoryView } from "@/components/views/StoryView";
import { metaFor } from "@/lib/seo";

export const metadata = metaFor("en", "story");

export default function Page() {
  return <StoryView lang="en" />;
}
