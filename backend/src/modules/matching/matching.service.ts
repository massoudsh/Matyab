import { prisma } from "../../db/prisma";
import { badRequest, forbidden, notFound } from "../../middlewares/http-error";
import { createNotification } from "../notifications/notifications.service";
import { haversineDistanceKm } from "../shipping/shipping.service";

type MatchRequest = {
  id: string;
  categoryId: string;
  quantity: number;
  project: { ownerId: string; lat: number | null; lng: number | null };
};

type MatchListing = {
  id: string;
  categoryId: string;
  quantity: number;
  project: { lat: number | null; lng: number | null };
};

type MatchScore = { score: number; reason: string; distanceKm?: number };

export function scoreMatch(request: MatchRequest, listing: MatchListing): MatchScore {
  if (request.categoryId !== listing.categoryId) {
    return { score: 0, reason: "دسته مصالح متفاوت است" };
  }
  if (request.quantity <= 0 || listing.quantity <= 0) {
    return { score: 0, reason: "مقدار قابل تطبیق نیست" };
  }

  const quantityRatio = Math.min(listing.quantity / request.quantity, 1);
  let score = quantityRatio * 60;
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
    score += Math.max(0, 40 - distanceKm * 0.4);
  } else {
    score += 20;
  }

  const quantityPercent = Math.round(quantityRatio * 100);
  const distanceReason = distanceKm != null ? `، فاصله ${distanceKm.toFixed(1)} کیلومتر` : "";
  return { score: Math.round(score), reason: `تطابق دسته و ${quantityPercent}٪ هم‌پوشانی مقدار${distanceReason}`, distanceKm };
}

export async function createMatchIfNew(
  requestId: string,
  listingId: string,
  score: MatchScore
) {
  try {
    return await prisma.$transaction(async (tx) => {
      const match = await tx.match.create({
        data: {
          listingId,
          requestId,
          matchScore: score.score,
          reason: score.reason,
          status: "SUGGESTED",
        },
      });
      if (score.distanceKm != null) {
        await tx.shippingEstimate.create({
          data: {
            matchId: match.id,
            distanceKm: score.distanceKm,
            estimatedCost: Math.round(score.distanceKm * 15000),
          },
        });
      }
      return match;
    });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") return undefined;
    throw error;
  }
}

async function matchRequestAgainstListings(request: MatchRequest, listings: MatchListing[]) {
  const created = [];
  for (const listing of listings) {
    const score = scoreMatch(request, listing);
    if (score.score <= 0) continue;
    const match = await createMatchIfNew(request.id, listing.id, score);
    if (match) created.push(match);
  }
  return created;
}

async function notifyRequestOwner(request: MatchRequest, count: number) {
  if (count === 0) return;
  await createNotification({
    userId: request.project.ownerId,
    type: "MATCH_FOUND",
    title: `${count} مصالح مشابه با درخواست شما پیدا شد`,
    body: `برای درخواست شما ${count} آگهی عرضه‌ی مرتبط پیدا شد.`,
    refType: "material_request",
    refId: request.id,
  });
}

export async function generateMatchesForRequest(requestId: string) {
  const request = await prisma.materialRequest.findUniqueOrThrow({
    where: { id: requestId },
    include: { project: true },
  });
  const listings = await prisma.listing.findMany({
    where: { categoryId: request.categoryId, status: "ACTIVE" },
    include: { project: true },
  });
  const created = await matchRequestAgainstListings(request, listings);
  await notifyRequestOwner(request, created.length);
  return created;
}

export async function generateMatchesForListing(listingId: string) {
  const listing = await prisma.listing.findUniqueOrThrow({
    where: { id: listingId },
    include: { project: true },
  });
  if (listing.status !== "ACTIVE") return [];

  const requests = await prisma.materialRequest.findMany({
    where: { categoryId: listing.categoryId, status: "ACTIVE" },
    include: { project: true },
  });
  const created = [];
  for (const request of requests) {
    const matches = await matchRequestAgainstListings(request, [listing]);
    await notifyRequestOwner(request, matches.length);
    created.push(...matches);
  }
  return created;
}

interface MatchFilters {
  requestId?: string;
  listingId?: string;
  status?: "SUGGESTED" | "ACCEPTED" | "REJECTED";
}

export async function findMatchesForUser(userId: string, userRole: string | undefined, filters: MatchFilters) {
  return prisma.match.findMany({
    where: {
      requestId: filters.requestId,
      listingId: filters.listingId,
      status: filters.status,
      OR:
        userRole === "ADMIN"
          ? undefined
          : [
              { listing: { project: { ownerId: userId } } },
              { request: { project: { ownerId: userId } } },
            ],
    },
    include: { listing: true, request: true, shippingEstimate: true },
    orderBy: { matchScore: "desc" },
  });
}

export async function updateMatchStatus(
  id: string,
  userId: string,
  userRole: string | undefined,
  status: "ACCEPTED" | "REJECTED"
) {
  const match = await prisma.match.findUnique({
    where: { id },
    include: { listing: { include: { project: true } }, request: { include: { project: true } } },
  });
  if (!match) throw notFound("مچ");
  if (userRole !== "ADMIN" && match.listing.project.ownerId !== userId && match.request.project.ownerId !== userId) {
    throw forbidden();
  }
  if (match.status !== "SUGGESTED") throw badRequest("فقط مچ پیشنهادی قابل تغییر است");
  return prisma.match.update({ where: { id }, data: { status } });
}
