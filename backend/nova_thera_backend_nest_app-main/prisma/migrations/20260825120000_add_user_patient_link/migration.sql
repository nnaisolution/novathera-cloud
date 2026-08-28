-- AlterTable
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "patientId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_patientId_key" ON "user"("patientId");

-- CreateIndex
-- Postgres allows repeated NULLs under a unique index, so rows without a phone
-- number are unaffected. This will fail if two existing rows share the same
-- non-null phoneNumber; deduplicate those before applying.
CREATE UNIQUE INDEX "user_phoneNumber_key" ON "user"("phoneNumber");
