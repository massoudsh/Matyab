import { prisma } from "../../db/prisma";

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

export async function getProjectById(id: string) {
  return prisma.project.findUnique({ where: { id } });
}
