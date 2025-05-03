/*
  Warnings:

  - You are about to drop the column `institution_logo` on the `Accounts` table. All the data in the column will be lost.
  - You are about to drop the column `institution_name` on the `Accounts` table. All the data in the column will be lost.
  - Made the column `institution_id` on table `Accounts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Accounts" DROP COLUMN "institution_logo",
DROP COLUMN "institution_name",
ALTER COLUMN "institution_id" SET NOT NULL;
