import { prisma } from "../../db/prisma";
import { env } from "../../config/env";

/** فاصله‌ی هوایی بین دو نقطه بر اساس فرمول Haversine (کیلومتر) */
export function haversineDistanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export async function estimateShipping(fromProjectId: string, toProjectId: string) {
  const [from, to] = await Promise.all([
    prisma.project.findUniqueOrThrow({ where: { id: fromProjectId } }),
    prisma.project.findUniqueOrThrow({ where: { id: toProjectId } }),
  ]);

  if (from.lat == null || from.lng == null || to.lat == null || to.lng == null) {
    throw new Error("مختصات جغرافیایی یکی از پروژه‌ها ثبت نشده است");
  }

  const distanceKm = haversineDistanceKm(
    { lat: from.lat, lng: from.lng },
    { lat: to.lat, lng: to.lng }
  );

  // TODO(ISSUE-902): نرخ واقعی باید بر اساس تن/نوع مصالح هم تنظیم شود؛ فعلاً نرخ ثابت پایه.
  const estimatedCost = Math.round(distanceKm * env.shippingBaseRatePerKm);

  return { distanceKm: Number(distanceKm.toFixed(1)), estimatedCost };
}
