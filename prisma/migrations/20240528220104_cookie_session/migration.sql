/*
  Warnings:

  - You are about to drop the `tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tokens" DROP CONSTRAINT "tokens_user_id_fkey";

-- DropTable
DROP TABLE "tokens";

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "session_token" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "ip_location" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
