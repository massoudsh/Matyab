-- AlterTable
ALTER TABLE "listings"
ADD COLUMN "moderationReason" TEXT,
ADD COLUMN "moderatedAt" TIMESTAMP(3);
