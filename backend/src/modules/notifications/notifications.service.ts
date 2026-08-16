import { prisma } from "../../db/prisma";

/**
 * سرویس اعلان درون‌اپ — E14.
 * دو نوع اعلان تولید می‌شود:
 * - MATCH_FOUND: از matching.service وقتی برای یک MaterialRequest، Listing جدیدی match می‌شود.
 * - PROCUREMENT_CRITICAL: از procurement.service وقتی یک BoqItem به وضعیت CRITICAL می‌رسد.
 */

interface CreateNotificationInput {
  userId: string;
  type: "MATCH_FOUND" | "PROCUREMENT_CRITICAL";
  title: string;
  body?: string;
  refType?: string;
  refId?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({ data: input });
}

/**
 * مثل createNotification ولی اگر همین (userId, type, refId) قبلاً به‌صورت خوانده‌نشده
 * ثبت شده باشد، رکورد تکراری نمی‌سازد — برای جلوگیری از اسپم PROCUREMENT_CRITICAL
 * که هر بار risk-report درخواست می‌شود دوباره محاسبه می‌شود.
 */
export async function createNotificationOnce(input: CreateNotificationInput) {
  if (input.refId) {
    const existing = await prisma.notification.findFirst({
      where: { userId: input.userId, type: input.type, refId: input.refId, isRead: false },
    });
    if (existing) return existing;
  }
  return createNotification(input);
}

export async function findNotifications(userId: string, unreadOnly?: boolean) {
  return prisma.notification.findMany({
    where: { userId, isRead: unreadOnly ? false : undefined },
    orderBy: { createdAt: "desc" },
  });
}

export async function unreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function markAsRead(id: string, userId: string) {
  return prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
}
