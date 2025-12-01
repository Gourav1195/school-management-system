-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "dob" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "tenantId" TEXT;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
