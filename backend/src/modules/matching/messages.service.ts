import { prisma } from "../../db/prisma";
import { badRequest, forbidden, notFound } from "../../middlewares/http-error";

async function getAcceptedMatch(matchId: string, userId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      listing: { include: { project: true } },
      request: { include: { project: true } },
    },
  });
  if (!match) throw notFound("مچ");
  if (match.status !== "ACCEPTED") throw badRequest("فقط مچ پذیرفته‌شده امکان پیام‌رسانی دارد");

  const participantIds = [match.listing.project.ownerId, match.request.project.ownerId];
  if (!participantIds.includes(userId)) throw forbidden();
  return { match, receiverId: participantIds.find((id) => id !== userId) ?? userId };
}

export async function findMessages(matchId: string, userId: string) {
  await getAcceptedMatch(matchId, userId);
  return prisma.message.findMany({
    where: { matchId },
    include: { sender: { select: { id: true, fullName: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function createMessage(matchId: string, senderId: string, body: string) {
  const { receiverId } = await getAcceptedMatch(matchId, senderId);
  const text = body.trim();
  if (!text) throw badRequest("متن پیام الزامی است");
  return prisma.message.create({
    data: { matchId, senderId, receiverId, body: text },
    include: { sender: { select: { id: true, fullName: true } } },
  });
}
