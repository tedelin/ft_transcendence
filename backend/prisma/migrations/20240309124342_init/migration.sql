-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ONLINE', 'OFFLINE', 'IN_GAME');

-- CreateEnum
CREATE TYPE "playerRole" AS ENUM ('PLAYER_ONE', 'PLAYER_TWO');

-- CreateEnum
CREATE TYPE "gameStatus" AS ENUM ('IN_GAME', 'FINISHED');

-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('ACCEPTED', 'PENDING', 'BLOCKED');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE', 'PROTECTED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MEMBER', 'BANNED', 'MUTED', 'ADMIN', 'OWNER');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "id42" INTEGER,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT 'default-avatar.jpg',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "useTwoFA" BOOLEAN NOT NULL DEFAULT false,
    "secretTwoFA" TEXT,
    "status" "UserStatus" NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" SERIAL NOT NULL,
    "initiatorId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "status" "FriendshipStatus" NOT NULL,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password" TEXT,
    "visibility" "Visibility" NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "ChannelUser" (
    "channelName" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ChannelUser_pkey" PRIMARY KEY ("channelName","userId")
);

-- CreateTable
CREATE TABLE "ChannelMessage" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "senderId" INTEGER NOT NULL,

    CONSTRAINT "ChannelMessage_pkey" PRIMARY KEY ("id")
);

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
    "status" "gameStatus" NOT NULL,

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

-- CreateTable
CREATE TABLE "achievement" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "firstGame" BOOLEAN NOT NULL,
    "firstWin" BOOLEAN NOT NULL,
    "firstLoose" BOOLEAN NOT NULL,
    "masterWinner" BOOLEAN NOT NULL,
    "invincible_guardian" BOOLEAN NOT NULL,
    "Speed_Demon" BOOLEAN NOT NULL,

    CONSTRAINT "achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private_messages" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,

    CONSTRAINT "private_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_id42_key" ON "users"("id42");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_initiatorId_receiverId_key" ON "Friendship"("initiatorId", "receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_name_key" ON "Channel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "stats_userId_key" ON "stats"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "achievement_userId_key" ON "achievement"("userId");

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelUser" ADD CONSTRAINT "ChannelUser_channelName_fkey" FOREIGN KEY ("channelName") REFERENCES "Channel"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelUser" ADD CONSTRAINT "ChannelUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMessage" ADD CONSTRAINT "ChannelMessage_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMessage" ADD CONSTRAINT "ChannelMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stats" ADD CONSTRAINT "stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchUser" ADD CONSTRAINT "MatchUser_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchUser" ADD CONSTRAINT "MatchUser_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement" ADD CONSTRAINT "achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_messages" ADD CONSTRAINT "private_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_messages" ADD CONSTRAINT "private_messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
