import { prisma } from "../../db/prisma";

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

export async function updateListingStatus(id: string, status: "ACTIVE" | "REJECTED") {
  return prisma.listing.update({ where: { id }, data: { status } });
}

export async function getListingById(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: { category: true, qualityAssessment: true, priceSuggestion: true, project: true },
  });
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

export async function createListing(input: CreateListingInput) {
  // TODO(ISSUE-502): بعد از ساخت آگهی، الگوریتم مچینگ باید trigger شود.
  return prisma.listing.create({ data: { ...input, status: "PENDING_REVIEW" } });
}
