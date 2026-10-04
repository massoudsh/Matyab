import { prisma } from "../../db/prisma";
import { forbidden, notFound } from "../../middlewares/http-error";

interface CreateProjectInput {
  name: string;
  city: string;
  region?: string;
  address?: string;
  lat?: number;
  lng?: number;
  ownerId: string;
}

export async function createProject(input: CreateProjectInput) {
  return prisma.project.create({ data: input });
}

export async function findProjectsByOwner(ownerId: string) {
  return prisma.project.findMany({ where: { ownerId }, orderBy: { createdAt: "desc" } });
}

export async function assertProjectOwner(projectId: string, userId: string, userRole?: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw notFound("پروژه");
  if (userRole !== "ADMIN" && project.ownerId !== userId) throw forbidden();
  return project;
}

export async function getProjectById(id: string, userId: string, userRole?: string) {
  return assertProjectOwner(id, userId, userRole);
}
