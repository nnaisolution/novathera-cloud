-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('ASSESSMENT', 'LAB', 'PROTOCOL', 'CONSENT', 'GUIDE', 'OTHER');

-- CreateTable
CREATE TABLE "document" (
    "id" TEXT NOT NULL,
    "customerUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL DEFAULT 'OTHER',
    "fileUrl" TEXT NOT NULL,
    "fileSizeBytes" INTEGER,
    "uploadedByEmployeeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "document_customerUserId_idx" ON "document"("customerUserId");

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_uploadedByEmployeeId_fkey" FOREIGN KEY ("uploadedByEmployeeId") REFERENCES "employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
