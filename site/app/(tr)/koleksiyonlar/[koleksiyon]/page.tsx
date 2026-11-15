import { collectionPage } from "@/lib/dynamicPages";

const p = collectionPage("tr", "koleksiyon");

export const dynamicParams = false;
export const generateStaticParams = p.generateStaticParams;
export const generateMetadata = p.generateMetadata;
export default p.Page;
