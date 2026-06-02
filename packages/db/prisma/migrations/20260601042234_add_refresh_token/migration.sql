-- AlterTable
ALTER TABLE "User" ADD COLUMN     "refreshToken" TEXT DEFAULT '',
ALTER COLUMN "password" SET DEFAULT '';
