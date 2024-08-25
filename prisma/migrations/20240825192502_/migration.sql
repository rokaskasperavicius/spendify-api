/*
  Warnings:

  - A unique constraint covering the columns `[transaction_id]` on the table `Transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Transactions_transaction_id_key" ON "Transactions"("transaction_id");
