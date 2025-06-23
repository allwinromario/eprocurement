-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "approvalReason" TEXT,
ADD COLUMN     "approvedVendorId" TEXT;

-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN     "approvalReason" TEXT;
