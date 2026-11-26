import config from "@payload-config";
import type { Metadata } from "next";
import { getPayload } from "payload";
import { PreorderView } from "@/components/preorder/PreorderView";

export const metadata: Metadata = {
  title: "Geçiş berjeri · Tahtırevan",
  description: "Altından laciverde on dört kadife bant. Siparişle, elde yapılır.",
  openGraph: { images: ["/siparis/gecis-genel.webp"] },
};

// Fiyat ve teslim süresi panelden (Reklam testi › Sipariş sayfası) gelir; kaydedince sayfa yenilenir.
export const revalidate = 60;

export default async function Page() {
  let settings: { open?: boolean | null; price?: string | null; priceNote?: string | null; leadTime?: string | null } = {};
  try {
    const payload = await getPayload({ config });
    settings = await payload.findGlobal({ slug: "on-siparis-sayfasi", depth: 0 });
  } catch {
    // Ayar okunamazsa sayfa varsayılanlarla açılır.
  }
  return (
    <PreorderView
      product="gecis"
      open={settings.open !== false}
      price={settings.price?.trim() || ""}
      priceNote={settings.priceNote?.trim() || ""}
      leadTime={settings.leadTime?.trim() || "Yaklaşık 3 ay"}
    />
  );
}
