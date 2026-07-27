import { prisma } from "../../db/prisma";

/**
 * سرویس Quality Scoring (فاز V1 — ISSUE-701/703).
 * فعلاً پیاده‌سازی placeholder است: ثبت دستی امتیاز (source=MANUAL).
 * TODO: اتصال به مدل تحلیل تصویر واقعی + صف async (ISSUE-702).
 */
export async function submitQualityAssessment(
  listingId: string,
  input: { score: number; grade: "A" | "B" | "C"; notes?: string }
) {
  return prisma.qualityAssessment.upsert({
    where: { listingId },
    create: { listingId, ...input, source: "MANUAL" },
    update: { ...input, source: "MANUAL" },
  });
}

export async function getQualityAssessment(listingId: string) {
  return prisma.qualityAssessment.findUnique({ where: { listingId } });
}
