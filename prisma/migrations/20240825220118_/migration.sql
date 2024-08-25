/*
  Warnings:

  - Made the column `date` on table `Transactions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Transactions" ALTER COLUMN "date" SET NOT NULL;
