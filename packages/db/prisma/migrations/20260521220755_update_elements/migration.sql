/*
  Warnings:

  - You are about to drop the column `message` on the `Elements` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `Elements` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Elements` table. All the data in the column will be lost.
  - Added the required column `angle` to the `Elements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `backgroundColor` to the `Elements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `Elements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fillStyle` to the `Elements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `height` to the `Elements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isDeleted` to the `Elements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isLocked` to the `Elements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `opacity` to the `Elements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roughness` to the `Elements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seed` to the `Elements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strokeColor` to the `Elements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strokeStyle` to the `Elements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strokeWidth` to the `Elements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Elements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Elements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version` to the `Elements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `Elements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `x` to the `Elements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `y` to the `Elements` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Elements" DROP CONSTRAINT "Elements_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Elements" DROP CONSTRAINT "Elements_userId_fkey";

-- AlterTable
ALTER TABLE "Elements" DROP COLUMN "message",
DROP COLUMN "roomId",
DROP COLUMN "userId",
ADD COLUMN     "angle" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "autoResize" BOOLEAN,
ADD COLUMN     "backgroundColor" TEXT NOT NULL,
ADD COLUMN     "boundTextElementId" TEXT,
ADD COLUMN     "containerId" TEXT,
ADD COLUMN     "createdAt" INTEGER NOT NULL,
ADD COLUMN     "edgeStyle" TEXT,
ADD COLUMN     "endArrowHead" TEXT,
ADD COLUMN     "endBinding" JSONB,
ADD COLUMN     "fillStyle" TEXT NOT NULL,
ADD COLUMN     "fontFamily" TEXT,
ADD COLUMN     "fontSize" INTEGER,
ADD COLUMN     "fontWeight" TEXT,
ADD COLUMN     "height" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL,
ADD COLUMN     "isEditing" BOOLEAN,
ADD COLUMN     "isLocked" BOOLEAN NOT NULL,
ADD COLUMN     "lineHeight" DOUBLE PRECISION,
ADD COLUMN     "opacity" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "originalText" TEXT,
ADD COLUMN     "points" JSONB,
ADD COLUMN     "pressures" DOUBLE PRECISION[] DEFAULT ARRAY[]::DOUBLE PRECISION[],
ADD COLUMN     "roughness" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "seed" INTEGER NOT NULL,
ADD COLUMN     "simulatePressure" BOOLEAN,
ADD COLUMN     "startArrowHead" TEXT,
ADD COLUMN     "startBinding" JSONB,
ADD COLUMN     "strokeColor" TEXT NOT NULL,
ADD COLUMN     "strokeStyle" TEXT NOT NULL,
ADD COLUMN     "strokeWidth" TEXT NOT NULL,
ADD COLUMN     "text" TEXT,
ADD COLUMN     "textAlign" TEXT,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "updatedAt" INTEGER NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL,
ADD COLUMN     "verticalAlign" TEXT,
ADD COLUMN     "width" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "x" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "y" INTEGER NOT NULL;
