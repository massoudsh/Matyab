import { Router } from "express";
import { estimateShipping } from "./shipping.service";

export const shippingRouter = Router();

shippingRouter.get("/estimate", async (req, res, next) => {
  try {
    const { fromProjectId, toProjectId } = req.query;
    if (!fromProjectId || !toProjectId) {
      return res.status(400).json({ error: "fromProjectId و toProjectId الزامی است" });
    }
    const estimate = await estimateShipping(fromProjectId as string, toProjectId as string);
    res.json(estimate);
  } catch (err) {
    next(err);
  }
});
