import { legalPage } from "@/lib/dynamicPages";

const p = legalPage("tr", "cookies");
export const metadata = p.metadata;
export default p.Page;
