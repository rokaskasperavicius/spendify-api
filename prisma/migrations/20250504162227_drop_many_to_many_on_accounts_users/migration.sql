/*
  Warnings:

  - You are about to drop the `_AccountsToUsers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AccountsToUsers" DROP CONSTRAINT "_AccountsToUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "_AccountsToUsers" DROP CONSTRAINT "_AccountsToUsers_B_fkey";

-- DropTable
DROP TABLE "_AccountsToUsers";

-- AddForeignKey
ALTER TABLE "Accounts" ADD CONSTRAINT "Accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
