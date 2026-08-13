-- CreateEnum
CREATE TYPE "PokemonStatus" AS ENUM ('SEEN', 'SCANNED');

-- CreateEnum
CREATE TYPE "ScanSource" AS ENUM ('WILD_SEARCH', 'AI_IMAGE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPokemon" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "pokemonId" INTEGER NOT NULL,
    "status" "PokemonStatus" NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scannedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPokemon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "pokemonId" INTEGER NOT NULL,
    "source" "ScanSource" NOT NULL DEFAULT 'WILD_SEARCH',
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserPokemon_userId_status_idx" ON "UserPokemon"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "UserPokemon_userId_pokemonId_key" ON "UserPokemon"("userId", "pokemonId");

-- CreateIndex
CREATE INDEX "ScanHistory_userId_scannedAt_idx" ON "ScanHistory"("userId", "scannedAt");

-- AddForeignKey
ALTER TABLE "UserPokemon" ADD CONSTRAINT "UserPokemon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanHistory" ADD CONSTRAINT "ScanHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
