import { legalPage } from "@/lib/dynamicPages";

const p = legalPage("en", "cookies");
export const metadata = p.metadata;
export default p.Page;
