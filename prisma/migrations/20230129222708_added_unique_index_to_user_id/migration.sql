/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `solicitations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "solicitations_user_id_key" ON "solicitations"("user_id");
