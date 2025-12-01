/*
  Warnings:

  - You are about to drop the column `addedAt` on the `UserFavGroup` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "joiningDate" SET DEFAULT date_trunc('year', now()) + interval '3 months';

-- AlterTable
ALTER TABLE "UserFavGroup" DROP COLUMN "addedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
