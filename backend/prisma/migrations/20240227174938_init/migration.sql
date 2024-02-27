/*
  Warnings:

  - You are about to drop the column `createdAt` on the `private_messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "private_messages" DROP COLUMN "createdAt",
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
