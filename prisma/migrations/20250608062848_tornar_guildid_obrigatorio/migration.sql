/*
  Warnings:

  - The primary key for the `CallTime` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `CallTime` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `guildId` to the `CallTime` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "CallTimeHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "joinTime" DATETIME NOT NULL,
    "leaveTime" DATETIME NOT NULL,
    CONSTRAINT "CallTimeHistory_userId_guildId_fkey" FOREIGN KEY ("userId", "guildId") REFERENCES "CallTime" ("userId", "guildId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CallTime" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "totalMs" BIGINT NOT NULL DEFAULT 0
);
INSERT INTO "new_CallTime" ("id", "totalMs", "userId") SELECT "id", "totalMs", "userId" FROM "CallTime";
DROP TABLE "CallTime";
ALTER TABLE "new_CallTime" RENAME TO "CallTime";
CREATE UNIQUE INDEX "CallTime_userId_guildId_key" ON "CallTime"("userId", "guildId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CallTimeHistory_userId_guildId_idx" ON "CallTimeHistory"("userId", "guildId");
