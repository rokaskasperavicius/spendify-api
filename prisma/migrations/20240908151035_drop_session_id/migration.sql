/*
  Warnings:

  - The primary key for the `Sessions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Sessions" DROP CONSTRAINT "Sessions_pkey",
DROP COLUMN "id";
