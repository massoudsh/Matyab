import { Router } from "express";
import { getCategoryTree } from "./categories.service";

export const categoriesRouter = Router();

categoriesRouter.get("/", async (_req, res, next) => {
  try {
    res.json(await getCategoryTree());
  } catch (err) {
    next(err);
  }
});
