import { Router } from "express";
import { z } from "zod";
import { AuthenticatedRequest, requireAuth } from "../../middlewares/auth.middleware";
import { createMessage, findMessages } from "./messages.service";
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

matchingRouter.get("/:id/messages", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    res.json(await findMessages(req.params.id, req.userId!));
  } catch (err) {
    next(err);
  }
});

matchingRouter.post("/:id/messages", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  const input = z.object({ body: z.string().trim().min(1, "متن پیام الزامی است").max(2000, "متن پیام حداکثر ۲۰۰۰ نویسه است") }).strict().safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: input.error.issues[0]?.message ?? "پیام نامعتبر است" });
  try {
    res.status(201).json(await createMessage(req.params.id, req.userId!, input.data.body));
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
