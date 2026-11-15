import { legalPage } from "@/lib/dynamicPages";

const p = legalPage("tr", "privacy");
export const metadata = p.metadata;
export default p.Page;
