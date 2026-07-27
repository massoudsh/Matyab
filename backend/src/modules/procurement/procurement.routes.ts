import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import {
  compareSuppliers,
  createBoqItem,
  createOrder,
  createSupplier,
  createSupplierQuote,
  findBoqItems,
  findSuppliers,
  forecastNeeds,
  procurementRiskReport,
  updateOrderStatus,
} from "./procurement.service";

export const procurementRouter = Router();

// ---------- Suppliers ----------

procurementRouter.get("/suppliers", async (req, res, next) => {
  try {
    const suppliers = await findSuppliers(req.query.categoryId as string | undefined);
    res.json(suppliers);
  } catch (err) {
    next(err);
  }
});

procurementRouter.post("/suppliers", requireAuth, async (req, res, next) => {
  try {
    const supplier = await createSupplier(req.body);
    res.status(201).json(supplier);
  } catch (err) {
    next(err);
  }
});

procurementRouter.get("/suppliers/compare", async (req, res, next) => {
  try {
    const categoryId = req.query.categoryId as string | undefined;
    if (!categoryId) return res.status(400).json({ error: "categoryId الزامی است" });
    const result = await compareSuppliers(categoryId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

procurementRouter.post("/suppliers/:id/quotes", requireAuth, async (req, res, next) => {
  try {
    const quote = await createSupplierQuote({
      supplierId: req.params.id,
      categoryId: req.body.categoryId,
      unitPrice: Number(req.body.unitPrice),
      leadTimeDays: Number(req.body.leadTimeDays),
      validUntil: req.body.validUntil ? new Date(req.body.validUntil) : undefined,
    });
    res.status(201).json(quote);
  } catch (err) {
    next(err);
  }
});

// ---------- BOQ ----------

procurementRouter.get("/boq-items", requireAuth, async (req, res, next) => {
  try {
    const projectId = req.query.projectId as string | undefined;
    if (!projectId) return res.status(400).json({ error: "projectId الزامی است" });
    const items = await findBoqItems(projectId);
    res.json(items);
  } catch (err) {
    next(err);
  }
});

procurementRouter.post("/boq-items", requireAuth, async (req, res, next) => {
  try {
    const item = await createBoqItem({
      projectId: req.body.projectId,
      categoryId: req.body.categoryId,
      requiredQuantity: Number(req.body.requiredQuantity),
      unit: req.body.unit,
      neededBy: new Date(req.body.neededBy),
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// ---------- سفارش‌های خرید ----------

procurementRouter.post("/orders", requireAuth, async (req, res, next) => {
  try {
    const order = await createOrder({
      boqItemId: req.body.boqItemId,
      supplierId: req.body.supplierId,
      quantity: Number(req.body.quantity),
      unitPrice: Number(req.body.unitPrice),
      expectedDeliveryDate: new Date(req.body.expectedDeliveryDate),
    });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

procurementRouter.patch("/orders/:id/status", requireAuth, async (req, res, next) => {
  try {
    const order = await updateOrderStatus(
      req.params.id,
      req.body.status,
      req.body.actualDeliveryDate ? new Date(req.body.actualDeliveryDate) : undefined
    );
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// ---------- پیش‌بینی و گزارش ریسک ----------

procurementRouter.get("/forecast", requireAuth, async (req, res, next) => {
  try {
    const projectId = req.query.projectId as string | undefined;
    if (!projectId) return res.status(400).json({ error: "projectId الزامی است" });
    const forecast = await forecastNeeds(projectId);
    res.json(forecast);
  } catch (err) {
    next(err);
  }
});

procurementRouter.get("/risk-report", requireAuth, async (req, res, next) => {
  try {
    const projectId = req.query.projectId as string | undefined;
    if (!projectId) return res.status(400).json({ error: "projectId الزامی است" });
    const report = await procurementRiskReport(projectId);
    res.json(report);
  } catch (err) {
    next(err);
  }
});
