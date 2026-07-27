import { Router } from "express";
import { prisma } from "../../db/prisma";
import { requireAuth } from "../../middlewares/auth.middleware";

export const matchingRouter = Router();

matchingRouter.get("/", async (req, res, next) => {
  try {
    const { requestId, listingId } = req.query;
    const matches = await prisma.match.findMany({
      where: {
        requestId: requestId as string | undefined,
        listingId: listingId as string | undefined,
      },
      include: { listing: true, request: true, shippingEstimate: true },
      orderBy: { matchScore: "desc" },
    });
    res.json(matches);
  } catch (err) {
    next(err);
  }
});

matchingRouter.post("/:id/accept", requireAuth, async (req, res, next) => {
  try {
    const match = await prisma.match.update({
      where: { id: req.params.id },
      data: { status: "ACCEPTED" },
    });
    res.json(match);
  } catch (err) {
    next(err);
  }
});

matchingRouter.post("/:id/reject", requireAuth, async (req, res, next) => {
  try {
    const match = await prisma.match.update({
      where: { id: req.params.id },
      data: { status: "REJECTED" },
    });
    res.json(match);
  } catch (err) {
    next(err);
  }
});
