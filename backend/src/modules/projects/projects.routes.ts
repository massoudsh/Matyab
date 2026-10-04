import { Router } from "express";
import { AuthenticatedRequest, requireAuth } from "../../middlewares/auth.middleware";
import { createProject, findProjectsByOwner, getProjectById } from "./projects.service";

export const projectsRouter = Router();

projectsRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const projects = await findProjectsByOwner(req.userId!);
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

projectsRouter.post("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const project = await createProject({ ...req.body, ownerId: req.userId! });
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

projectsRouter.get("/:id", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const project = await getProjectById(req.params.id, req.userId!, req.userRole);
    res.json(project);
  } catch (err) {
    next(err);
  }
});
