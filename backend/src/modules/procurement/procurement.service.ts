import { prisma } from "../../db/prisma";

/**
 * سرویس کوپایلوت تأمین (Procurement Copilot) — E13.
 * ورودی: BOQ هر پروژه (چه مصالحی تا چه تاریخی لازم است)، قیمت‌های پیشنهادی
 * تأمین‌کننده‌ها (SupplierQuote) و تاریخچه‌ی سفارش‌ها (ProcurementOrder).
 * خروجی: پیش‌بینی نیاز ۴ تا ۸ هفته‌ی آینده، ریسک قیمت، مقایسه‌ی تأمین‌کننده
 * و یک گزارش ریسک تأمین قابل‌فهم برای هر ردیف BOQ.
 *
 * فعلاً منطق rule-based ساده است (هم‌راستا با pricing/matching فعلی پروژه)؛
 * TODO: جایگزینی با مدل پیش‌بینی دقیق‌تر وقتی داده‌ی تاریخی کافی جمع شد.
 */

const DEFAULT_LEAD_TIME_DAYS = 14;
const CRITICAL_WEEKS_THRESHOLD = 2;
const WATCH_WEEKS_THRESHOLD = 8; // بازه‌ی پیش‌بینی نیاز طبق wedge اولیه: ۴ تا ۸ هفته

// ---------- Suppliers ----------

interface CreateSupplierInput {
  name: string;
  phone?: string;
  city?: string;
}

export async function createSupplier(input: CreateSupplierInput) {
  return prisma.supplier.create({ data: input });
}

export async function findSuppliers(categoryId?: string) {
  return prisma.supplier.findMany({
    where: categoryId ? { quotes: { some: { categoryId } } } : undefined,
    include: { quotes: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });
}

interface CreateQuoteInput {
  supplierId: string;
  categoryId: string;
  unitPrice: number;
  leadTimeDays: number;
  validUntil?: Date;
}

export async function createSupplierQuote(input: CreateQuoteInput) {
  return prisma.supplierQuote.create({ data: input });
}

/** قابلیت‌اطمینان یک تأمین‌کننده بر اساس تاریخچه‌ی سفارش‌های تحویل‌شده/تأخیردار */
async function supplierReliability(supplierId: string) {
  const orders = await prisma.procurementOrder.findMany({
    where: { supplierId, status: { in: ["DELIVERED", "DELAYED"] } },
  });

  if (orders.length === 0) {
    return { onTimeRate: null as number | null, avgDelayDays: null as number | null, sampleSize: 0 };
  }

  const onTime = orders.filter(
    (o) => o.actualDeliveryDate != null && o.actualDeliveryDate <= o.expectedDeliveryDate
  ).length;

  const delays = orders
    .filter((o) => o.actualDeliveryDate != null && o.actualDeliveryDate > o.expectedDeliveryDate)
    .map((o) => (o.actualDeliveryDate!.getTime() - o.expectedDeliveryDate.getTime()) / 86_400_000);

  const avgDelayDays = delays.length > 0 ? delays.reduce((s, d) => s + d, 0) / delays.length : 0;

  return {
    onTimeRate: Math.round((onTime / orders.length) * 100) / 100,
    avgDelayDays: Math.round(avgDelayDays * 10) / 10,
    sampleSize: orders.length,
  };
}

export async function compareSuppliers(categoryId: string) {
  const quotes = await prisma.supplierQuote.findMany({
    where: { categoryId },
    include: { supplier: true },
    orderBy: { unitPrice: "asc" },
  });

  return Promise.all(
    quotes.map(async (q) => {
      const reliability = await supplierReliability(q.supplierId);
      return {
        supplierId: q.supplierId,
        supplierName: q.supplier.name,
        city: q.supplier.city,
        unitPrice: q.unitPrice,
        leadTimeDays: q.leadTimeDays,
        quoteId: q.id,
        ...reliability,
      };
    })
  );
}

// ---------- BOQ (فهرست مقادیر پروژه) ----------

interface CreateBoqItemInput {
  projectId: string;
  categoryId: string;
  requiredQuantity: number;
  unit: string;
  neededBy: Date;
}

export async function createBoqItem(input: CreateBoqItemInput) {
  return prisma.boqItem.create({ data: input });
}

export async function findBoqItems(projectId: string) {
  return prisma.boqItem.findMany({
    where: { projectId },
    include: { category: true },
    orderBy: { neededBy: "asc" },
  });
}

// ---------- سفارش‌های خرید ----------

interface CreateOrderInput {
  boqItemId: string;
  supplierId: string;
  quantity: number;
  unitPrice: number;
  expectedDeliveryDate: Date;
}

export async function createOrder(input: CreateOrderInput) {
  const order = await prisma.procurementOrder.create({ data: { ...input, status: "ORDERED" } });
  await prisma.boqItem.update({
    where: { id: input.boqItemId },
    data: { orderedQuantity: { increment: input.quantity } },
  });
  return order;
}

export async function updateOrderStatus(
  id: string,
  status: "ORDERED" | "DELIVERED" | "DELAYED" | "CANCELLED",
  actualDeliveryDate?: Date
) {
  const needsDeliveryDate = status === "DELIVERED" || status === "DELAYED";
  return prisma.procurementOrder.update({
    where: { id },
    data: {
      status,
      actualDeliveryDate: actualDeliveryDate ?? (needsDeliveryDate ? new Date() : undefined),
    },
  });
}

// ---------- ریسک قیمت ----------

export async function priceRiskForCategory(categoryId: string, region?: string) {
  const since = new Date();
  since.setDate(since.getDate() - 60);

  const history = await prisma.priceHistory.findMany({
    where: { categoryId, region, recordedAt: { gte: since } },
    orderBy: { recordedAt: "asc" },
  });

  const midpoint = new Date();
  midpoint.setDate(midpoint.getDate() - 30);

  const older = history.filter((h) => h.recordedAt < midpoint).map((h) => h.price);
  const recent = history.filter((h) => h.recordedAt >= midpoint).map((h) => h.price);

  if (older.length === 0 || recent.length === 0) {
    return { level: "UNKNOWN" as const, changePct: null as number | null, sampleSize: history.length };
  }

  const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length;
  const changePct = ((avg(recent) - avg(older)) / avg(older)) * 100;

  let level: "LOW" | "MEDIUM" | "HIGH";
  if (changePct >= 8) level = "HIGH";
  else if (changePct >= 3) level = "MEDIUM";
  else level = "LOW";

  return { level, changePct: Math.round(changePct * 10) / 10, sampleSize: history.length };
}

// ---------- پیش‌بینی نیاز و گزارش ریسک ----------

async function avgLeadTimeDays(categoryId: string) {
  const quotes = await prisma.supplierQuote.findMany({ where: { categoryId } });
  if (quotes.length === 0) return DEFAULT_LEAD_TIME_DAYS;
  return Math.round(quotes.reduce((s, q) => s + q.leadTimeDays, 0) / quotes.length);
}

export type ProcurementStatus = "FULFILLED" | "OK" | "WATCH" | "CRITICAL";

export async function forecastNeeds(projectId: string) {
  const boqItems = await prisma.boqItem.findMany({
    where: { projectId },
    include: { category: true },
    orderBy: { neededBy: "asc" },
  });

  const now = new Date();

  return Promise.all(
    boqItems.map(async (item) => {
      const remaining = item.requiredQuantity - item.orderedQuantity;
      const leadTimeDays = await avgLeadTimeDays(item.categoryId);
      const mustOrderBy = new Date(item.neededBy.getTime() - leadTimeDays * 86_400_000);
      const daysUntilOrderDeadline = Math.round((mustOrderBy.getTime() - now.getTime()) / 86_400_000);
      const weeksUntilCritical = Math.round((daysUntilOrderDeadline / 7) * 10) / 10;

      let status: ProcurementStatus;
      if (remaining <= 0) status = "FULFILLED";
      else if (daysUntilOrderDeadline < 0 || weeksUntilCritical <= CRITICAL_WEEKS_THRESHOLD) status = "CRITICAL";
      else if (weeksUntilCritical <= WATCH_WEEKS_THRESHOLD) status = "WATCH";
      else status = "OK";

      return {
        boqItemId: item.id,
        categoryId: item.categoryId,
        categoryName: item.category.name,
        unit: item.unit,
        requiredQuantity: item.requiredQuantity,
        orderedQuantity: item.orderedQuantity,
        remainingQuantity: Math.max(0, remaining),
        neededBy: item.neededBy,
        leadTimeDays,
        mustOrderBy,
        weeksUntilCritical,
        status,
      };
    })
  );
}

export async function procurementRiskReport(projectId: string) {
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  const forecast = await forecastNeeds(projectId);

  return Promise.all(
    forecast.map(async (f) => {
      const priceRisk = await priceRiskForCategory(f.categoryId, project.city);
      const suppliers = await compareSuppliers(f.categoryId);
      const bestSupplier = suppliers[0] ?? null;

      let recommendation: string;
      if (f.status === "FULFILLED") {
        recommendation = "این قلم کاملاً سفارش داده شده؛ اقدام فوری لازم نیست.";
      } else if (f.status === "CRITICAL") {
        recommendation = `این قلم critical است — با زمان تحویل حدود ${f.leadTimeDays} روز، اگر همین هفته سفارش داده نشود برنامه‌ی پروژه درگیر می‌شود.`;
      } else if (f.status === "WATCH") {
        recommendation = `تا حدود ${f.weeksUntilCritical} هفته‌ی دیگر باید سفارش نهایی شود؛ از الان تأمین‌کننده را انتخاب کنید.`;
      } else {
        recommendation = "فعلاً در بازه‌ی امن (بیش از ۸ هفته تا مهلت سفارش)؛ نیازی به اقدام فوری نیست.";
      }

      if (priceRisk.level === "HIGH" && priceRisk.changePct != null) {
        recommendation += ` قیمت این دسته طی یک ماه اخیر حدود ${priceRisk.changePct}٪ افزایش داشته — خرید زودتر می‌تواند صرفه‌جویی کند.`;
      }

      if (suppliers.length > 1) {
        recommendation += " چندمنبعی (چند تأمین‌کننده) برای این قلم پیشنهاد می‌شود.";
      }

      return {
        ...f,
        priceRisk,
        bestSupplier,
        supplierCount: suppliers.length,
        recommendation,
      };
    })
  );
}
