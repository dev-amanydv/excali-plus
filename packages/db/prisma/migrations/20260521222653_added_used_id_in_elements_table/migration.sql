/*
  Warnings:

  - Added the required column `userId` to the `Elements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Elements" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Elements" ADD CONSTRAINT "Elements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
