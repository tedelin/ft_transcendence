/*
  Warnings:

  - Added the required column `status` to the `match` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "gameStatus" AS ENUM ('IN_GAME', 'FINISHED');

-- AlterTable
ALTER TABLE "match" ADD COLUMN     "status" "gameStatus" NOT NULL;
