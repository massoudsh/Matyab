import { Router } from "express";
import { z } from "zod";
import { AuthenticatedRequest, requireAuth } from "../../middlewares/auth.middleware";
import { createRequest, findRequests, getRequestById, updateRequest } from "./requests.service";

const requestInputSchema = z.object({
  projectId: z.string().trim().min(1, "پروژه الزامی است"),
  categoryId: z.string().trim().min(1, "دسته مصالح الزامی است"),
  quantity: z.number().finite("مقدار نامعتبر است").positive("مقدار باید بیشتر از صفر باشد"),
  budget: z.number().finite("بودجه نامعتبر است").positive("بودجه باید بیشتر از صفر باشد").optional(),
  deadline: z.coerce.date({ invalid_type_error: "تاریخ مهلت نامعتبر است" }).refine(
    (date) => date >= new Date(new Date().toDateString()),
    "تاریخ مهلت نمی‌تواند در گذشته باشد"
  ).optional(),
}).strict();

const requestUpdateSchema = requestInputSchema.pick({ quantity: true, budget: true, deadline: true }).partial().refine(
  (input) => Object.keys(input).length > 0,
  "حداقل یک فیلد برای ویرایش لازم است"
);

function validationError(result: z.SafeParseError<unknown>, res: { status: (code: number) => { json: (body: unknown) => unknown } }) {
  return res.status(400).json({ error: result.error.issues[0]?.message ?? "داده درخواست نامعتبر است" });
}

export const requestsRouter = Router();

requestsRouter.get("/", async (req, res, next) => {
  const filters = z.object({
    categoryId: z.string().trim().min(1).optional(),
    projectId: z.string().trim().min(1).optional(),
    city: z.string().trim().min(1).optional(),
  }).safeParse(req.query);
  if (!filters.success) return validationError(filters, res);
  try {
    const requests = await findRequests(filters.data.categoryId, filters.data.projectId, filters.data.city);
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

requestsRouter.patch("/:id", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  const input = requestUpdateSchema.safeParse(req.body);
  if (!input.success) return validationError(input, res);
  try {
    res.json(await updateRequest(req.params.id, input.data, req.userId!, req.userRole));
  } catch (err) {
    next(err);
  }
});

requestsRouter.post("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  const input = requestInputSchema.safeParse(req.body);
  if (!input.success) return validationError(input, res);
  try {
    const request = await createRequest(input.data, req.userId!, req.userRole);
    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
});
