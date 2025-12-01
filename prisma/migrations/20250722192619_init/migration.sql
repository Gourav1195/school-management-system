-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "joiningDate" SET DEFAULT date_trunc('year', now()) + interval '3 months';
