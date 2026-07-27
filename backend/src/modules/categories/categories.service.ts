import { prisma } from "../../db/prisma";

/** فهرست درختی دسته‌ها (کش‌شدنی در Redis طبق ISSUE-202) */
export async function getCategoryTree() {
  const all = await prisma.materialCategory.findMany();
  const byId = new Map(all.map((c) => [c.id, { ...c, children: [] as unknown[] }]));
  const roots: unknown[] = [];

  for (const cat of byId.values()) {
    if (cat.parentId) {
      byId.get(cat.parentId)?.children.push(cat);
    } else {
      roots.push(cat);
    }
  }

  return roots;
}
