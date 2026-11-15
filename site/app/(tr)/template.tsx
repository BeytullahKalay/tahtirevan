import type { ReactNode } from "react";
import { PageFade } from "@/components/PageFade";

export default function Template({ children }: { children: ReactNode }) {
  return <PageFade>{children}</PageFade>;
}
