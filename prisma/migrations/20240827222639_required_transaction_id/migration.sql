/*
  Warnings:

  - You are about to drop the column `transaction_id` on the `Transactions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `Transactions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `Transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Transactions_transaction_id_key";

-- AlterTable
ALTER TABLE "Transactions" DROP COLUMN "transaction_id",
ADD COLUMN     "id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_id_key" ON "Transactions"("id");
