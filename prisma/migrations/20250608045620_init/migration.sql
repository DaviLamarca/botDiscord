-- CreateTable
CREATE TABLE "CallTime" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "totalMs" BIGINT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CallTime_userId_key" ON "CallTime"("userId");
