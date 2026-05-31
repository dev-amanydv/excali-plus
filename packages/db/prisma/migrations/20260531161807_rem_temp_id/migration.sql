/*
  Warnings:

  - You are about to drop the column `tempId` on the `Room` table. All the data in the column will be lost.
  - Made the column `adminId` on table `Room` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_adminId_fkey";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "tempId",
ALTER COLUMN "adminId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
