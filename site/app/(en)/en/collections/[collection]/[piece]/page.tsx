import { piecePage } from "@/lib/dynamicPages";

const p = piecePage("en", "collection", "piece");

export const dynamicParams = false;
export const generateStaticParams = p.generateStaticParams;
export const generateMetadata = p.generateMetadata;
export default p.Page;
