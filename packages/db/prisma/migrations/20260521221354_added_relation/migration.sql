/*
  Warnings:

  - Added the required column `roomId` to the `Elements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Elements" ADD COLUMN     "roomId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Elements" ADD CONSTRAINT "Elements_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
