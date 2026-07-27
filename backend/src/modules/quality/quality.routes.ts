import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { getQualityAssessment, submitQualityAssessment } from "./quality.service";

export const qualityRouter = Router();

qualityRouter.get("/:listingId/quality-score", async (req, res, next) => {
  try {
    const assessment = await getQualityAssessment(req.params.listingId);
    res.json(assessment);
  } catch (err) {
    next(err);
  }
});

qualityRouter.post("/:listingId/quality-score", requireAuth, async (req, res, next) => {
  try {
    const assessment = await submitQualityAssessment(req.params.listingId, req.body);
    res.status(201).json(assessment);
  } catch (err) {
    next(err);
  }
});
