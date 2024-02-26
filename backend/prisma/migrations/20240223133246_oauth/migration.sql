/*
  Warnings:

  - The `oauthId` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[oauthId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "oauthId",
ADD COLUMN     "oauthId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "users_oauthId_key" ON "users"("oauthId");
