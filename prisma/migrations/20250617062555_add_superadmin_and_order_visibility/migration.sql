-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUPERADMIN';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "visibleToVendors" BOOLEAN NOT NULL DEFAULT false;
