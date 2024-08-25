/*
  Warnings:

  - Added the required column `total_amount` to the `Transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "total_amount" INTEGER NOT NULL;
