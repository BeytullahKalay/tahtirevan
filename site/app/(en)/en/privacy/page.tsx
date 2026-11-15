import { legalPage } from "@/lib/dynamicPages";

const p = legalPage("en", "privacy");
export const metadata = p.metadata;
export default p.Page;
