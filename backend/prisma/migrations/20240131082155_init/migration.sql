/*
  Warnings:

  - You are about to drop the `match_history` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "playerRole" AS ENUM ('PLAYER_ONE', 'PLAYER_TWO');

-- DropForeignKey
ALTER TABLE "match_history" DROP CONSTRAINT "match_history_userId_fkey";

-- DropTable
DROP TABLE "match_history";

-- CreateTable
CREATE TABLE "stats" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nbGames" INTEGER NOT NULL,
    "nbWin" INTEGER NOT NULL,
    "nbLoose" INTEGER NOT NULL,

    CONSTRAINT "stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchUser" (
    "playerId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "role" "playerRole" NOT NULL,

    CONSTRAINT "MatchUser_pkey" PRIMARY KEY ("playerId","matchId")
);

-- CreateIndex
CREATE UNIQUE INDEX "stats_userId_key" ON "stats"("userId");

-- AddForeignKey
ALTER TABLE "stats" ADD CONSTRAINT "stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchUser" ADD CONSTRAINT "MatchUser_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchUser" ADD CONSTRAINT "MatchUser_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
