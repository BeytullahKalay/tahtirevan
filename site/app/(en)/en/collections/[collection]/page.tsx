import { collectionPage } from "@/lib/dynamicPages";

const p = collectionPage("en", "collection");

export const generateStaticParams = p.generateStaticParams;
export const generateMetadata = p.generateMetadata;
export default p.Page;
