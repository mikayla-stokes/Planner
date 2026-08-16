-- CreateTable
CREATE TABLE "LinkDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "category" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LinkDocument_category_idx" ON "LinkDocument"("category");
