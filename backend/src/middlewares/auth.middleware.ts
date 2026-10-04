import { NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { forbidden, unauthorized } from "./http-error";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function requireAuth(req: AuthenticatedRequest, _res: unknown, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(unauthorized());
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string; role: string };
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    return next(unauthorized());
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, _res: unknown, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return next(forbidden());
    }
    next();
  };
}
