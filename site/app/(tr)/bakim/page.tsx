import { legalPage } from "@/lib/dynamicPages";

const p = legalPage("tr", "care");
export const metadata = p.metadata;
export default p.Page;
