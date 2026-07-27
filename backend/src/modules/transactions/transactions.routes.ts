import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { addReview, createTransaction, getTransactionById } from "./transactions.service";

export const transactionsRouter = Router();

transactionsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const { matchId, finalPrice } = req.body;
    const transaction = await createTransaction(matchId, finalPrice);
    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
});

transactionsRouter.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const transaction = await getTransactionById(req.params.id);
    if (!transaction) return res.status(404).json({ error: "معامله یافت نشد" });
    res.json(transaction);
  } catch (err) {
    next(err);
  }
});

transactionsRouter.post("/:id/review", requireAuth, async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const review = await addReview(req.params.id, rating, comment);
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});
