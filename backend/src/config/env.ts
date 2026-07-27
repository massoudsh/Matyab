import "dotenv/config";

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  shippingBaseRatePerKm: Number(process.env.SHIPPING_BASE_RATE_PER_KM ?? 15000),
};
