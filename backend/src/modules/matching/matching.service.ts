import { prisma } from "../../db/prisma";
import { haversineDistanceKm } from "../shipping/shipping.service";
import { createNotification } from "../notifications/notifications.service";

/**
 * الگوریتم rule-based مچینگ (فاز MVP — ISSUE-502).
 * برای یک MaterialRequest جدید، Listing های هم‌دسته را پیدا می‌کند،
 * بر اساس هم‌پوشانی مقدار و فاصله امتیاز می‌دهد و رکورد Match می‌سازد.
 * روی هر match جدید، طبق E14 یک اعلان MATCH_FOUND برای مالک پروژه‌ی درخواست ساخته می‌شود.
 */
export async function generateMatchesForRequest(requestId: string) {
  const request = await prisma.materialRequest.findUniqueOrThrow({
    where: { id: requestId },
    include: { project: true },
  });

  const candidates = await prisma.listing.findMany({
    where: { categoryId: request.categoryId, status: "ACTIVE" },
    include: { project: true },
  });

  const created = [];
  for (const listing of candidates) {
    const { score, reason, distanceKm } = scoreMatch(request, listing);
    if (score <= 0) continue;

    const match = await prisma.match.create({
      data: {
        listingId: listing.id,
        requestId: request.id,
        matchScore: score,
        reason,
        status: "SUGGESTED",
      },
    });

    if (distanceKm != null) {
      // TODO(ISSUE-902): استفاده از سرویس واقعی هزینه‌ی حمل به‌جای نرخ ساده
      await prisma.shippingEstimate.create({
        data: {
          matchId: match.id,
          distanceKm,
          estimatedCost: Math.round(distanceKm * 15000),
        },
      });
    }

    created.push(match);
  }

  if (created.length > 0) {
    await createNotification({
      userId: request.project.ownerId,
      type: "MATCH_FOUND",
      title: `${created.length} مصالح مشابه با درخواست شما پیدا شد`,
      body: `برای درخواست شما در دسته‌ی این پروژه، ${created.length} آگهی عرضه‌ی مرتبط پیدا شد.`,
      refType: "material_request",
      refId: request.id,
    });
  }

  return created;
}

function scoreMatch(
  request: { quantity: number; project: { lat: number | null; lng: number | null } },
  listing: {
    quantity: number;
    askingPrice: number;
    project: { lat: number | null; lng: number | null };
  }
) {
  // ۱. هم‌پوشانی مقدار: هرچه مقدار Listing به نیاز نزدیک‌تر باشد امتیاز بالاتر
  const quantityRatio = Math.min(listing.quantity / request.quantity, 1);
  let score = quantityRatio * 60; // حداکثر ۶۰ امتیاز از مقدار

  let distanceKm: number | undefined;
  if (
    request.project.lat != null &&
    request.project.lng != null &&
    listing.project.lat != null &&
    listing.project.lng != null
  ) {
    distanceKm = haversineDistanceKm(
      { lat: request.project.lat, lng: request.project.lng },
      { lat: listing.project.lat, lng: listing.project.lng }
    );
    // هرچه فاصله کمتر، امتیاز بیشتر (حداکثر ۴۰ امتیاز، صفر بعد از ۱۰۰ کیلومتر)
    score += Math.max(0, 40 - distanceKm * 0.4);
  } else {
    score += 20; // بدون مختصات، امتیاز متوسط پیش‌فرض
  }

  const reason =
    distanceKm != null
      ? `تطابق دسته، فاصله ${distanceKm.toFixed(1)} کیلومتر`
      : "تطابق دسته";

  return { score: Math.round(score), reason, distanceKm };
}
