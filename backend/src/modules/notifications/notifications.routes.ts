import { Router } from "express";
import { AuthenticatedRequest, requireAuth } from "../../middlewares/auth.middleware";
import { findNotifications, markAllAsRead, markAsRead, unreadCount } from "./notifications.service";

export const notificationsRouter = Router();

notificationsRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const unreadOnly = req.query.unreadOnly === "true";
    const notifications = await findNotifications(req.userId!, unreadOnly);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
});

notificationsRouter.get("/unread-count", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const count = await unreadCount(req.userId!);
    res.json({ count });
  } catch (err) {
    next(err);
  }
});

notificationsRouter.patch("/:id/read", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    await markAsRead(req.params.id, req.userId!);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

notificationsRouter.patch("/read-all", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    await markAllAsRead(req.userId!);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
