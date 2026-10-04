import { prisma } from "../../db/prisma";
import { badRequest, forbidden, notFound } from "../../middlewares/http-error";
import { assertProjectOwner } from "../projects/projects.service";
import { generateMatchesForRequest } from "../matching/matching.service";

interface CreateRequestInput {
  projectId: string;
  categoryId: string;
  quantity: number;
  budget?: number;
  deadline?: Date;
}

type UpdateRequestInput = Partial<Pick<CreateRequestInput, "quantity" | "budget" | "deadline">>;

export async function createRequest(input: CreateRequestInput, userId: string, userRole?: string) {
  await assertProjectOwner(input.projectId, userId, userRole);
  const category = await prisma.materialCategory.findUnique({ where: { id: input.categoryId } });
  if (!category) throw badRequest("دسته مصالح نامعتبر است");
  const request = await prisma.materialRequest.create({ data: { ...input, status: "ACTIVE" } });

  // ISSUE-502: مچینگ بلافاصله بعد از ثبت درخواست trigger می‌شود (نه cron).
  // اگر مچینگ خطا بدهد نباید ثبت درخواست را fail کند — فقط لاگ می‌شود.
  generateMatchesForRequest(request.id).catch((err) => {
    console.error(`generateMatchesForRequest failed for request ${request.id}:`, err);
  });

  return request;
}

export async function updateRequest(id: string, input: UpdateRequestInput, userId: string, userRole?: string) {
  const request = await prisma.materialRequest.findUnique({ where: { id }, include: { project: true } });
  if (!request) throw notFound("درخواست");
  if (userRole !== "ADMIN" && request.project.ownerId !== userId) throw forbidden();
  return prisma.materialRequest.update({ where: { id }, data: input });
}

export async function findRequests(categoryId?: string, projectId?: string, city?: string) {
  return prisma.materialRequest.findMany({
    where: { status: "ACTIVE", categoryId, projectId, project: city ? { city } : undefined },
    include: { category: true, project: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRequestById(id: string, userId: string, userRole?: string) {
  const request = await prisma.materialRequest.findUnique({
    where: { id },
    include: { category: true, project: true },
  });
  if (!request) throw notFound("درخواست");
  if (userRole !== "ADMIN" && request.project.ownerId !== userId) throw forbidden();
  return request;
}
