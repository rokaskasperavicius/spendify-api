/*
  Warnings:

  - The primary key for the `accounts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `account_iban` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `account_id` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `account_name` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `bank_logo` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `bank_name` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `accounts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_id_fkey";

-- AlterTable
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_pkey",
DROP COLUMN "account_iban",
DROP COLUMN "account_id",
DROP COLUMN "account_name",
DROP COLUMN "bank_logo",
DROP COLUMN "bank_name",
DROP COLUMN "user_id",
ADD COLUMN     "balance" TEXT,
ADD COLUMN     "iban" TEXT,
ADD COLUMN     "institution_logo" TEXT,
ADD COLUMN     "institution_name" TEXT,
ADD COLUMN     "name" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "accounts_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "accounts_id_seq";

-- CreateTable
CREATE TABLE "UserAccounts" (
    "user_id" INTEGER NOT NULL,
    "account_id" TEXT NOT NULL,

    CONSTRAINT "UserAccounts_pkey" PRIMARY KEY ("user_id","account_id")
);

-- AddForeignKey
ALTER TABLE "UserAccounts" ADD CONSTRAINT "UserAccounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAccounts" ADD CONSTRAINT "UserAccounts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
