import { Router } from "express";
import { AuthenticatedRequest, requireAuth } from "../../middlewares/auth.middleware";
import { createRequest, findRequests, getRequestById } from "./requests.service";

export const requestsRouter = Router();

requestsRouter.get("/", async (req, res, next) => {
  try {
    const requests = await findRequests(
      req.query.categoryId as string | undefined,
      req.query.projectId as string | undefined
    );
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

requestsRouter.get("/:id", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const request = await getRequestById(req.params.id, req.userId!, req.userRole);
    res.json(request);
  } catch (err) {
    next(err);
  }
});

requestsRouter.post("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const request = await createRequest(req.body, req.userId!, req.userRole);
    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
});
