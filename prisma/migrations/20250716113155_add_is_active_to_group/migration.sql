-- AlterEnum
ALTER TYPE "GenderType" ADD VALUE 'Others';

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "joiningDate" SET DEFAULT date_trunc('year', now()) + interval '3 months';
