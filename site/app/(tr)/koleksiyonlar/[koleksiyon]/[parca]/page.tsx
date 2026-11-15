import { piecePage } from "@/lib/dynamicPages";

const p = piecePage("tr", "koleksiyon", "parca");

export const generateStaticParams = p.generateStaticParams;
export const generateMetadata = p.generateMetadata;
export default p.Page;
