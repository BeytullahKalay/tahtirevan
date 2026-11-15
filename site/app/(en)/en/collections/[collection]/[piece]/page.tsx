import { piecePage } from "@/lib/dynamicPages";

const p = piecePage("en", "collection", "piece");

export const generateStaticParams = p.generateStaticParams;
export const generateMetadata = p.generateMetadata;
export default p.Page;
