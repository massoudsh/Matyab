import { Router } from "express";
import { loginUser, registerUser } from "./auth.service";
import { AuthenticatedRequest, requireAuth } from "../../middlewares/auth.middleware";
import { prisma } from "../../db/prisma";

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const result = await loginUser(phone, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    res.json(user);
  } catch (err) {
    next(err);
  }
});
