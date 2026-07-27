import { PrismaClient } from "@prisma/client";

// یک instance واحد Prisma برای کل اپلیکیشن (جلوگیری از اتصال‌های اضافه در dev hot-reload)
export const prisma = new PrismaClient();
