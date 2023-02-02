-- AlterTable
ALTER TABLE "solicitations" ADD COLUMN     "attendant_id" TEXT;

-- CreateTable
CREATE TABLE "attendants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "discord_username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "in_attendance" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "attendants_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "solicitations" ADD CONSTRAINT "solicitations_attendant_id_fkey" FOREIGN KEY ("attendant_id") REFERENCES "attendants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
