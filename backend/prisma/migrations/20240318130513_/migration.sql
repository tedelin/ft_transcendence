/*
  Warnings:

  - The values [MUTED] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('MEMBER', 'BANNED', 'ADMIN', 'OWNER');
ALTER TABLE "ChannelUser" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- AlterTable
ALTER TABLE "ChannelUser" ADD COLUMN     "muted" BOOLEAN NOT NULL DEFAULT false;
