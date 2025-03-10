-- CreateTable
CREATE TABLE "Assistant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "accessCode" TEXT NOT NULL,
    "shareableUrl" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isDemo" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "assistantId" TEXT NOT NULL,
    "vectorStoreId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "File_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Assistant_shareableUrl_key" ON "Assistant"("shareableUrl");
