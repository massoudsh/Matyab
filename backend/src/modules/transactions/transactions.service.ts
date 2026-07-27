import { prisma } from "../../db/prisma";

const COMMISSION_RATE = 0.03; // ۳٪ کمیسیون پلتفرم روی هر تراکنش موفق

export async function createTransaction(matchId: string, finalPrice: number) {
  const match = await prisma.match.findUniqueOrThrow({ where: { id: matchId } });
  if (match.status !== "ACCEPTED") {
    throw new Error("فقط match پذیرفته‌شده قابل تبدیل به معامله است");
  }

  const commission = Math.round(finalPrice * COMMISSION_RATE);

  return prisma.transaction.create({
    data: { matchId, finalPrice, commission, status: "PENDING" },
  });
}

export async function getTransactionById(id: string) {
  return prisma.transaction.findUnique({
    where: { id },
    include: { match: { include: { listing: true, request: true } }, reviews: true },
  });
}

export async function addReview(transactionId: string, rating: number, comment?: string) {
  if (rating < 1 || rating > 5) throw new Error("امتیاز باید بین ۱ تا ۵ باشد");
  return prisma.review.create({ data: { transactionId, rating, comment } });
}
