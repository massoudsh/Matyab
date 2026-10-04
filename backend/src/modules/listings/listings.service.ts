import { prisma } from "../../db/prisma";
import { badRequest, forbidden, notFound } from "../../middlewares/http-error";
import { assertProjectOwner } from "../projects/projects.service";

interface ListingFilters {
  categoryId?: string;
  city?: string;
  projectId?: string;
  minPrice?: number;
  maxPrice?: number;
}

export async function findListings(filters: ListingFilters) {
  return prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      categoryId: filters.categoryId,
      projectId: filters.projectId,
      askingPrice: {
        gte: filters.minPrice,
        lte: filters.maxPrice,
      },
      project: filters.city ? { city: filters.city } : undefined,
    },
    include: { category: true, qualityAssessment: true, priceSuggestion: true },
    orderBy: { createdAt: "desc" },
  });
}

/** پنل ادمین (MVP): فهرست آگهی‌های در انتظار تأیید. */
export async function findPendingListings() {
  return prisma.listing.findMany({
    where: { status: "PENDING_REVIEW" },
    include: { category: true, project: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function updateListingStatus(
  id: string,
  status: "ACTIVE" | "REJECTED",
  moderationReason?: string
) {
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) throw notFound("آگهی");
  if (listing.status !== "PENDING_REVIEW") {
    throw badRequest("فقط آگهی در انتظار بررسی قابل تأیید یا رد است");
  }

  return prisma.listing.update({
    where: { id },
    data: { status, moderationReason: moderationReason ?? null, moderatedAt: new Date() },
  });
}

export async function getListingById(id: string, userId: string, userRole?: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { category: true, qualityAssessment: true, priceSuggestion: true, project: true },
  });
  if (!listing) throw notFound("آگهی");
  if (userRole !== "ADMIN" && listing.project.ownerId !== userId) throw forbidden();
  return listing;
}

interface CreateListingInput {
  projectId: string;
  categoryId: string;
  quantity: number;
  unit: string;
  photos: string[];
  description?: string;
  askingPrice: number;
}

export async function createListing(input: CreateListingInput, userId: string, userRole?: string) {
  await assertProjectOwner(input.projectId, userId, userRole);
  return prisma.listing.create({ data: { ...input, status: "PENDING_REVIEW" } });
}
