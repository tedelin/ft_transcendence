-- CreateTable
CREATE TABLE "achievement" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "firstGame" BOOLEAN NOT NULL,
    "firstWin" BOOLEAN NOT NULL,
    "firstLoose" BOOLEAN NOT NULL,
    "masterWinner" BOOLEAN NOT NULL,
    "invincible_guardian" BOOLEAN NOT NULL,
    "Speed_Demon" BOOLEAN NOT NULL,

    CONSTRAINT "achievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "achievement_userId_key" ON "achievement"("userId");

-- AddForeignKey
ALTER TABLE "achievement" ADD CONSTRAINT "achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
