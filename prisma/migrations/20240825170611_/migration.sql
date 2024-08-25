/*
  Warnings:

  - You are about to drop the column `amount_int` on the `Transactions` table. All the data in the column will be lost.
  - Changed the type of `amount` on the `Transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Transactions" DROP COLUMN "amount_int",
DROP COLUMN "amount",
ADD COLUMN     "amount" INTEGER NOT NULL;
