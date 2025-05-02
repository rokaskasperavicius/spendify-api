-- AlterTable
ALTER TABLE "_AccountsToUsers" ADD CONSTRAINT "_AccountsToUsers_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_AccountsToUsers_AB_unique";
