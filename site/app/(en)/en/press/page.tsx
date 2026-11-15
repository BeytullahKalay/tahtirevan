import { legalPage } from "@/lib/dynamicPages";

const p = legalPage("en", "press");
export const metadata = p.metadata;
export default p.Page;
