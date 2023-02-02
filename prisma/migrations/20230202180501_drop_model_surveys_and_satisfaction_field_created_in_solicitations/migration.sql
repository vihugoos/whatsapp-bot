/*
  Warnings:

  - You are about to drop the `surveys` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "surveys" DROP CONSTRAINT "surveys_user_id_fkey";

-- AlterTable
ALTER TABLE "solicitations" ADD COLUMN     "satisfaction" TEXT;

-- DropTable
DROP TABLE "surveys";
