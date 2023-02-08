-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "cpf" TEXT,
    "rg" TEXT,
    "email" TEXT,
    "phone_number" TEXT NOT NULL,
    "stage" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "discord_username" TEXT NOT NULL,
    "discord_user_id" TEXT NOT NULL,
    "in_attendance" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "attendants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "attendant_id" TEXT,
    "service" TEXT NOT NULL,
    "open" BOOLEAN NOT NULL DEFAULT true,
    "start_at" TEXT NOT NULL,
    "end_at" TEXT,
    "bot_start_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bot_end_at" TIMESTAMP(3),
    "satisfaction" TEXT,

    CONSTRAINT "solicitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "users_rg_key" ON "users"("rg");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "attendants_discord_username_key" ON "attendants"("discord_username");

-- CreateIndex
CREATE UNIQUE INDEX "attendants_discord_user_id_key" ON "attendants"("discord_user_id");

-- AddForeignKey
ALTER TABLE "solicitations" ADD CONSTRAINT "solicitations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitations" ADD CONSTRAINT "solicitations_attendant_id_fkey" FOREIGN KEY ("attendant_id") REFERENCES "attendants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
