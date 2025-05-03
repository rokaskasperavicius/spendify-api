-- AlterTable
ALTER TABLE "Accounts" ADD COLUMN     "institution_id" TEXT;

-- CreateTable
CREATE TABLE "Institutions" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "logo" TEXT,

    CONSTRAINT "Institutions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Accounts" ADD CONSTRAINT "Accounts_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "Institutions"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
