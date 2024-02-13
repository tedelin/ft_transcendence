/*
  Warnings:

  - You are about to drop the column `createdAt` on the `ChannelUser` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ChannelUser` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Friendship` table. All the data in the column will be lost.
  - Changed the type of `visibility` on the `Channel` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `role` on the `ChannelUser` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `Friendship` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE', 'PROTECTED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "visibility",
ADD COLUMN     "visibility" "Visibility" NOT NULL;

-- AlterTable
ALTER TABLE "ChannelUser" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;

-- AlterTable
ALTER TABLE "Friendship" DROP COLUMN "createdAt",
DROP COLUMN "status",
ADD COLUMN     "status" "FriendshipStatus" NOT NULL;
