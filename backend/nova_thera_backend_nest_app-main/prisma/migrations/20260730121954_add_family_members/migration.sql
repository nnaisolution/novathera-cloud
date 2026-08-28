-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "familyMemberId" TEXT;

-- CreateTable
CREATE TABLE "family_member" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "family_member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "family_member_ownerUserId_idx" ON "family_member"("ownerUserId");

-- CreateIndex
CREATE INDEX "booking_familyMemberId_idx" ON "booking"("familyMemberId");

-- AddForeignKey
ALTER TABLE "family_member" ADD CONSTRAINT "family_member_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "family_member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
