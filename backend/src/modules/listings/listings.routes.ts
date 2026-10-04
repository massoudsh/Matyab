import { Router } from "express";
import { z } from "zod";
import { AuthenticatedRequest, requireAuth, requireRole } from "../../middlewares/auth.middleware";
import {
  createListing,
  findListings,
  findPendingListings,
  getListingById,
  updateListing,
  updateListingStatus,
} from "./listings.service";

const photosSchema = z.array(
  z.string().url("نشانی عکس معتبر نیست").refine((value) => /^https?:\/\//.test(value), "نشانی عکس باید با http یا https شروع شود")
).max(5, "حداکثر ۵ عکس مجاز است");

const listingInputSchema = z.object({
  projectId: z.string().trim().min(1, "پروژه الزامی است"),
  categoryId: z.string().trim().min(1, "دسته مصالح الزامی است"),
  quantity: z.number().finite("مقدار نامعتبر است").positive("مقدار باید بیشتر از صفر باشد"),
  unit: z.string().trim().min(1, "واحد الزامی است").max(20, "واحد حداکثر ۲۰ نویسه است"),
  photos: photosSchema,
  description: z.string().trim().max(1000, "توضیحات حداکثر ۱۰۰۰ نویسه است").optional(),
  askingPrice: z.number().finite("قیمت نامعتبر است").positive("قیمت باید بیشتر از صفر باشد"),
}).strict();

const listingUpdateSchema = listingInputSchema.pick({ quantity: true, unit: true, photos: true, description: true, askingPrice: true }).partial().refine(
  (input) => Object.keys(input).length > 0,
  "حداقل یک فیلد برای ویرایش لازم است"
);

function validationError(result: z.SafeParseError<unknown>, res: { status: (code: number) => { json: (body: unknown) => unknown } }) {
  return res.status(400).json({ error: result.error.issues[0]?.message ?? "داده آگهی نامعتبر است" });
}

export const listingsRouter = Router();

listingsRouter.get("/", async (req, res, next) => {
  const filters = z.object({
    categoryId: z.string().trim().min(1).optional(),
    city: z.string().trim().min(1).optional(),
    projectId: z.string().trim().min(1).optional(),
    minPrice: z.coerce.number().finite("حداقل قیمت نامعتبر است").nonnegative("حداقل قیمت نمی‌تواند منفی باشد").optional(),
    maxPrice: z.coerce.number().finite("حداکثر قیمت نامعتبر است").nonnegative("حداکثر قیمت نمی‌تواند منفی باشد").optional(),
  }).refine((input) => input.minPrice === undefined || input.maxPrice === undefined || input.minPrice <= input.maxPrice, "حداقل قیمت نمی‌تواند بیشتر از حداکثر قیمت باشد").safeParse(req.query);
  if (!filters.success) return validationError(filters, res);
  try {
    const listings = await findListings(filters.data);
    res.json(listings);
  } catch (err) {
    next(err);
  }
});

// باید قبل از GET /:id باشد وگرنه "pending" به‌عنوان id تفسیر می‌شود.
listingsRouter.get("/pending", requireAuth, requireRole("ADMIN"), async (_req, res, next) => {
  try {
    res.json(await findPendingListings());
  } catch (err) {
    next(err);
  }
});

listingsRouter.patch("/:id/status", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { status, moderationReason } = req.body as {
      status: "ACTIVE" | "REJECTED";
      moderationReason?: string;
    };
    if (status !== "ACTIVE" && status !== "REJECTED") {
      return res.status(400).json({ error: "وضعیت نامعتبر است" });
    }
    if (status === "REJECTED" && !moderationReason?.trim()) {
      return res.status(400).json({ error: "دلیل رد آگهی الزامی است" });
    }
    const listing = await updateListingStatus(req.params.id, status, moderationReason?.trim());
    res.json(listing);
  } catch (err) {
    next(err);
  }
});

listingsRouter.get("/:id", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const listing = await getListingById(req.params.id, req.userId!, req.userRole);
    res.json(listing);
  } catch (err) {
    next(err);
  }
});

listingsRouter.patch("/:id", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  const input = listingUpdateSchema.safeParse(req.body);
  if (!input.success) return validationError(input, res);
  try {
    res.json(await updateListing(req.params.id, input.data, req.userId!, req.userRole));
  } catch (err) {
    next(err);
  }
});

listingsRouter.post("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  const input = listingInputSchema.safeParse(req.body);
  if (!input.success) return validationError(input, res);
  try {
    const listing = await createListing(input.data, req.userId!, req.userRole);
    res.status(201).json(listing);
  } catch (err) {
    next(err);
  }
});
