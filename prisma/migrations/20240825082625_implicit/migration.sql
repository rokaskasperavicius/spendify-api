/*
  Warnings:

  - You are about to drop the `UserAccounts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserAccounts" DROP CONSTRAINT "UserAccounts_account_id_fkey";

-- DropForeignKey
ALTER TABLE "UserAccounts" DROP CONSTRAINT "UserAccounts_user_id_fkey";

-- DropTable
DROP TABLE "UserAccounts";

-- CreateTable
CREATE TABLE "_AccountsToUsers" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AccountsToUsers_AB_unique" ON "_AccountsToUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_AccountsToUsers_B_index" ON "_AccountsToUsers"("B");

-- AddForeignKey
ALTER TABLE "_AccountsToUsers" ADD CONSTRAINT "_AccountsToUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountsToUsers" ADD CONSTRAINT "_AccountsToUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
