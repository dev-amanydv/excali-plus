-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_adminId_fkey";

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "tempId" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "adminId" DROP NOT NULL;
DROP SEQUENCE "Room_id_seq";

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
