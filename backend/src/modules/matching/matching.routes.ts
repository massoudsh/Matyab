import { Router } from "express";
import { AuthenticatedRequest, requireAuth } from "../../middlewares/auth.middleware";
import { findMatchesForUser, updateMatchStatus } from "./matching.service";

export const matchingRouter = Router();

matchingRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { requestId, listingId, status } = req.query;
    if (status && !["SUGGESTED", "ACCEPTED", "REJECTED"].includes(status as string)) {
      return res.status(400).json({ error: "وضعیت مچ نامعتبر است" });
    }
    const matches = await findMatchesForUser(req.userId!, req.userRole, {
      requestId: requestId as string | undefined,
      listingId: listingId as string | undefined,
      status: status as "SUGGESTED" | "ACCEPTED" | "REJECTED" | undefined,
    });
    res.json(matches);
  } catch (err) {
    next(err);
  }
});

matchingRouter.post("/:id/accept", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    res.json(await updateMatchStatus(req.params.id, req.userId!, req.userRole, "ACCEPTED"));
  } catch (err) {
    next(err);
  }
});

matchingRouter.post("/:id/reject", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    res.json(await updateMatchStatus(req.params.id, req.userId!, req.userRole, "REJECTED"));
  } catch (err) {
    next(err);
  }
});
