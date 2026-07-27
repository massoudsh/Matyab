import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { createListing, findListings, getListingById } from "./listings.service";

export const listingsRouter = Router();

listingsRouter.get("/", async (req, res, next) => {
  try {
    const { categoryId, city, minPrice, maxPrice } = req.query;
    const listings = await findListings({
      categoryId: categoryId as string | undefined,
      city: city as string | undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
    res.json(listings);
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
