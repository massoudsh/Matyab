import { prisma } from "../../db/prisma";

/**
 * سرویس Price Suggestion (فاز V1 — ISSUE-803).
 * فعلاً میانگین قیمت ۳۰ روز اخیر همان دسته/منطقه را به‌عنوان مبنا برمی‌گرداند.
 * TODO: جایگزینی با مدل دقیق‌تر (وزن‌دهی بر اساس نمره‌ی کیفیت، تعداد نمونه، …)
 */
export async function suggestPrice(listingId: string) {
  const listing = await prisma.listing.findUniqueOrThrow({
    where: { id: listingId },
    include: { project: true },
  });

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const history = await prisma.priceHistory.findMany({
    where: {
      categoryId: listing.categoryId,
      region: listing.project.city,
      recordedAt: { gte: since },
    },
  });

  if (history.length === 0) {
    return {
      suggestedPrice: listing.askingPrice,
      minPrice: listing.askingPrice * 0.9,
      maxPrice: listing.askingPrice * 1.1,
      basis: "داده‌ی کافی برای پیشنهاد قیمت وجود ندارد؛ قیمت پیشنهادی فروشنده نمایش داده شده",
      sampleSize: 0,
    };
  }

  const prices = history.map((h) => h.price);
  const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;

  return {
    suggestedPrice: Math.round(avg),
    minPrice: Math.round(Math.min(...prices)),
    maxPrice: Math.round(Math.max(...prices)),
    basis: `بر اساس ${history.length} معامله‌ی مشابه در ${listing.project.city} طی ۳۰ روز اخیر`,
    sampleSize: history.length,
  };
}
