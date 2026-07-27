import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import {
  createListing,
  findListings,
  findPendingListings,
  getListingById,
  updateListingStatus,
} from "./listings.service";

export const listingsRouter = Router();

listingsRouter.get("/", async (req, res, next) => {
  try {
    const { categoryId, city, projectId, minPrice, maxPrice } = req.query;
    const listings = await findListings({
      categoryId: categoryId as string | undefined,
      city: city as string | undefined,
      projectId: projectId as string | undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
    res.json(listings);
  } catch (err) {
    next(err);
  }
});

// باید قبل از GET /:id باشد وگرنه "pending" به‌عنوان id تفسیر می‌شود.
listingsRouter.get("/pending", requireAuth, requireRole("ADMIN"), async (_req, res, next) => {
  try {
    res.json(await findPendingListings());
  } catch (err) {
    next(err);
  }
});

listingsRouter.patch("/:id/status", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { status } = req.body as { status: "ACTIVE" | "REJECTED" };
    if (status !== "ACTIVE" && status !== "REJECTED") {
      return res.status(400).json({ error: "وضعیت نامعتبر است" });
    }
    const listing = await updateListingStatus(req.params.id, status);
    res.json(listing);
  } catch (err) {
    next(err);
  }
});

listingsRouter.get("/:id", async (req, res, next) => {
  try {
    const listing = await getListingById(req.params.id);
    if (!listing) return res.status(404).json({ error: "آگهی یافت نشد" });
    res.json(listing);
  } catch (err) {
    next(err);
  }
});

listingsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const listing = await createListing(req.body);
    res.status(201).json(listing);
  } catch (err) {
    next(err);
  }
});
