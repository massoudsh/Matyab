import { prisma } from "../../db/prisma";

interface CreateRequestInput {
  projectId: string;
  categoryId: string;
  quantity: number;
  budget?: number;
  deadline?: Date;
}

export async function createRequest(input: CreateRequestInput) {
  // TODO(ISSUE-502): بعد از ساخت درخواست، الگوریتم مچینگ باید trigger شود.
  return prisma.materialRequest.create({ data: { ...input, status: "ACTIVE" } });
}

export async function findRequests(categoryId?: string, projectId?: string) {
  return prisma.materialRequest.findMany({
    where: { status: "ACTIVE", categoryId, projectId },
    include: { category: true, project: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRequestById(id: string) {
  return prisma.materialRequest.findUnique({
    where: { id },
    include: { category: true, project: true },
  });
}
