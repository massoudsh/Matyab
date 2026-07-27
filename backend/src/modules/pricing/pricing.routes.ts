import { Router } from "express";
import { suggestPrice } from "./pricing.service";

export const pricingRouter = Router();

pricingRouter.get("/:listingId/price-suggestion", async (req, res, next) => {
  try {
    const suggestion = await suggestPrice(req.params.listingId);
    res.json(suggestion);
  } catch (err) {
    next(err);
  }
});
