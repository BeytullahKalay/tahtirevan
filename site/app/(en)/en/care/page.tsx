import { legalPage } from "@/lib/dynamicPages";

const p = legalPage("en", "care");
export const metadata = p.metadata;
export default p.Page;
