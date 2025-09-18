-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PROCESSING', 'FAILED', 'FINISHED');

-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "status" "TransactionStatus";
