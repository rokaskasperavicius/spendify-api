/*
  Warnings:

  - Added the required column `balance` to the `Accounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Accounts" DROP COLUMN "balance",
ADD COLUMN     "balance" DOUBLE PRECISION NOT NULL;
