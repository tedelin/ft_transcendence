/*
  Warnings:

  - You are about to drop the column `invitation` on the `private_messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "private_messages" DROP COLUMN "invitation";
