/*
  Warnings:

  - Made the column `requisitionId` on table `Accounts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Accounts" ALTER COLUMN "requisitionId" SET NOT NULL;
