import { prisma } from "../../db/prisma";
import { forbidden, notFound } from "../../middlewares/http-error";
import { assertProjectOwner } from "../projects/projects.service";
import { generateMatchesForRequest } from "../matching/matching.service";

interface CreateRequestInput {
  projectId: string;
  categoryId: string;
  quantity: number;
  budget?: number;
  deadline?: Date;
}

export async function createRequest(input: CreateRequestInput, userId: string, userRole?: string) {
  await assertProjectOwner(input.projectId, userId, userRole);
  const request = await prisma.materialRequest.create({ data: { ...input, status: "ACTIVE" } });

  // ISSUE-502: مچینگ بلافاصله بعد از ثبت درخواست trigger می‌شود (نه cron).
  // اگر مچینگ خطا بدهد نباید ثبت درخواست را fail کند — فقط لاگ می‌شود.
  generateMatchesForRequest(request.id).catch((err) => {
    console.error(`generateMatchesForRequest failed for request ${request.id}:`, err);
  });

  return request;
}

export async function findRequests(categoryId?: string, projectId?: string) {
  return prisma.materialRequest.findMany({
    where: { status: "ACTIVE", categoryId, projectId },
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
