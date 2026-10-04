import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { id: "cat_rebar", name: "میلگرد", parentId: null },
  { id: "cat_cement", name: "سیمان و بلوک", parentId: null },
  { id: "cat_tile", name: "کاشی و سرامیک", parentId: null },
  { id: "cat_door_win", name: "درب و پنجره", parentId: null },
  { id: "cat_pipe", name: "لوله و اتصالات", parentId: null },
  { id: "cat_insulation", name: "عایق", parentId: null },
  { id: "cat_wood", name: "چوب", parentId: null },
  { id: "cat_rebar_8", name: "میلگرد ۸ میل", parentId: "cat_rebar" },
  { id: "cat_rebar_12", name: "میلگرد ۱۲ میل", parentId: "cat_rebar" },
  { id: "cat_block", name: "بلوک سیمانی", parentId: "cat_cement" },
];

async function main() {
  for (const category of categories) {
    await prisma.materialCategory.upsert({
      where: { id: category.id },
      update: { name: category.name, parentId: category.parentId },
      create: category,
    });
  }
}

main()
  .finally(() => prisma.$disconnect());
