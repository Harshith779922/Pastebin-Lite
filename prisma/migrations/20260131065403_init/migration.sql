-- CreateTable
CREATE TABLE "Paste" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "maxViews" INTEGER,
    "currentViews" INTEGER NOT NULL DEFAULT 0,
    "passwordHash" TEXT,

    CONSTRAINT "Paste_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Paste_expiresAt_idx" ON "Paste"("expiresAt");
