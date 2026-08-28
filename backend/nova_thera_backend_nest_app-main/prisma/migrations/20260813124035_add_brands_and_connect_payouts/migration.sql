/*
  Warnings:

  - Added the required column `brandId` to the `product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BrandOnboardingStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'PENDING_VERIFICATION', 'COMPLETE', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "BrandTransferStatus" AS ENUM ('NOT_APPLICABLE', 'OWED', 'AWAITING_ONBOARDING', 'PENDING', 'PAID', 'PARTIALLY_REVERSED', 'REVERSED', 'FAILED');

-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "isTest" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "isTest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeChargeId" TEXT,
ADD COLUMN     "stripeFeeCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stripeTransferGroup" TEXT;

-- AlterTable
ALTER TABLE "order_item" ADD COLUMN     "brandId" TEXT;

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "brandId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT,
    "logoUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "isPlatform" BOOLEAN NOT NULL DEFAULT false,
    "stripeAccountId" TEXT,
    "chargesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "onboardingStatus" "BrandOnboardingStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "requirementsDue" TEXT[],
    "stripeSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_brand_split" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "subtotalCents" INTEGER NOT NULL DEFAULT 0,
    "discountCents" INTEGER NOT NULL DEFAULT 0,
    "shippingCents" INTEGER NOT NULL DEFAULT 0,
    "taxCents" INTEGER NOT NULL DEFAULT 0,
    "grossCents" INTEGER NOT NULL DEFAULT 0,
    "stripeFeeCents" INTEGER NOT NULL DEFAULT 0,
    "transferCents" INTEGER NOT NULL DEFAULT 0,
    "reversedCents" INTEGER NOT NULL DEFAULT 0,
    "stripeTransferId" TEXT,
    "transferStatus" "BrandTransferStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "transferError" TEXT,
    "transferAttempt" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_brand_split_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brand_slug_key" ON "brand"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "brand_stripeAccountId_key" ON "brand"("stripeAccountId");

-- CreateIndex
CREATE INDEX "brand_active_idx" ON "brand"("active");

-- CreateIndex
CREATE INDEX "order_brand_split_brandId_idx" ON "order_brand_split"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "order_brand_split_orderId_brandId_key" ON "order_brand_split"("orderId", "brandId");

-- CreateIndex
CREATE INDEX "order_stripeChargeId_idx" ON "order"("stripeChargeId");

-- CreateIndex
CREATE INDEX "order_item_brandId_idx" ON "order_item"("brandId");

-- CreateIndex
CREATE INDEX "product_brandId_idx" ON "product"("brandId");

-- AddForeignKey
ALTER TABLE "order_brand_split" ADD CONSTRAINT "order_brand_split_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_brand_split" ADD CONSTRAINT "order_brand_split_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
