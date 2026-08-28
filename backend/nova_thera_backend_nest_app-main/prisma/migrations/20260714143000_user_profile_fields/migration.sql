-- Persist registration profile fields on the user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "marketingOptIn" BOOLEAN NOT NULL DEFAULT false;
