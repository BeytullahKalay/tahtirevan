import { fabricPage } from "@/lib/dynamicPages";

const p = fabricPage("tr", "kumas");

export const generateStaticParams = p.generateStaticParams;
export const generateMetadata = p.generateMetadata;
export default p.Page;
