import { ConsultationView } from "@/components/views/ConsultationView";
import { metaFor } from "@/lib/seo";

export const metadata = metaFor("en", "consultation");

export default function Page() {
  return <ConsultationView lang="en" />;
}
