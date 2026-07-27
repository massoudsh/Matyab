import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../db/prisma";
import { env } from "../../config/env";

interface RegisterInput {
  fullName: string;
  phone: string;
  password: string;
  role: "CONTRACTOR" | "SUPPLIER";
  city?: string;
}

const IRAN_PHONE_REGEX = /^09\d{9}$/;

export async function registerUser(input: RegisterInput) {
  if (!IRAN_PHONE_REGEX.test(input.phone)) {
    throw new Error("شماره موبایل نامعتبر است");
  }

  const existing = await prisma.user.findUnique({ where: { phone: input.phone } });
  if (existing) {
    throw new Error("این شماره موبایل قبلاً ثبت شده است");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      phone: input.phone,
      passwordHash,
      role: input.role,
      city: input.city,
    },
  });

  return signToken(user.id, user.role);
}

export async function loginUser(phone: string, password: string) {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new Error("کاربری با این شماره یافت نشد");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error("رمز عبور نادرست است");

  return signToken(user.id, user.role);
}

function signToken(userId: string, role: string) {
  const token = jwt.sign({ sub: userId, role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
  return { token };
}
