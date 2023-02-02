/*
  Warnings:

  - A unique constraint covering the columns `[discord_username]` on the table `attendants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `attendants` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "attendants_discord_username_key" ON "attendants"("discord_username");

-- CreateIndex
CREATE UNIQUE INDEX "attendants_email_key" ON "attendants"("email");
