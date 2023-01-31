/*
  Warnings:

  - You are about to drop the column `crm` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_crm_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "crm";
