import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
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

requestsRouter.get("/:id", async (req, res, next) => {
  try {
    const request = await getRequestById(req.params.id);
    if (!request) return res.status(404).json({ error: "درخواست یافت نشد" });
    res.json(request);
  } catch (err) {
    next(err);
  }
});

requestsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const request = await createRequest(req.body);
    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
});
