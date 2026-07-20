-- CreateEnum
CREATE TYPE "SlideshowSource" AS ENUM ('CUSTOM', 'BUSES', 'ROUTES');

-- CreateTable
CREATE TABLE "slideshow_config" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "source" "SlideshowSource" NOT NULL DEFAULT 'CUSTOM',
    "interval" INTEGER NOT NULL DEFAULT 5000,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slideshow_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_slides" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id")
);
