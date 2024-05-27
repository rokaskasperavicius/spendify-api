-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "accounts_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "tokens" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "tokens_pkey" PRIMARY KEY ("id");
