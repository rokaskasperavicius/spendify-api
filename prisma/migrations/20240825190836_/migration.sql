/*
  Warnings:

  - Added the required column `transaction_id` to the `Transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "transaction_id" TEXT NOT NULL;
