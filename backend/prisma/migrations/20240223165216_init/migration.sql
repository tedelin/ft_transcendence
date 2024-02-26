/*
  Warnings:

  - You are about to drop the column `oauthId` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_oauthId_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "oauthId";
