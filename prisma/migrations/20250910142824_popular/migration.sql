-- CreateEnum
CREATE TYPE "public"."AnimeStatus" AS ENUM ('FINISHED', 'ONGOING', 'UPCOMING', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."AnimeType" AS ENUM ('ANIME', 'FILME', 'SERIE');

-- CreateEnum
CREATE TYPE "public"."VideoQuality" AS ENUM ('HD', 'FULL_HD', 'ULTRA_HD_4K');

-- AlterTable
ALTER TABLE "public"."subscriptions" ADD COLUMN     "externalData" JSONB,
ADD COLUMN     "externalId" TEXT;

-- CreateTable
CREATE TABLE "public"."checkout_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "stripeSessionId" TEXT NOT NULL,
    "stripeStatus" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "priceId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "successUrl" TEXT,
    "cancelUrl" TEXT,
    "stripeData" JSONB,
    "expiresAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "subscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checkout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."animes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnail" TEXT,
    "banner" TEXT,
    "logo" TEXT,
    "year" INTEGER NOT NULL,
    "status" "public"."AnimeStatus" NOT NULL DEFAULT 'ONGOING',
    "type" "public"."AnimeType" NOT NULL DEFAULT 'ANIME',
    "rating" TEXT NOT NULL,
    "totalEpisodes" INTEGER,
    "isSubbed" BOOLEAN NOT NULL DEFAULT true,
    "isDubbed" BOOLEAN NOT NULL DEFAULT false,
    "genres" TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "director" TEXT,
    "studio" TEXT,
    "r2BucketPath" TEXT,
    "posterUrl" TEXT,
    "posterR2Key" TEXT,
    "bannerUrl" TEXT,
    "bannerR2Key" TEXT,
    "logoUrl" TEXT,
    "logoR2Key" TEXT,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seasons" (
    "id" TEXT NOT NULL,
    "animeId" TEXT NOT NULL,
    "seasonNumber" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "releaseDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "r2BucketPath" TEXT,
    "bannerUrl" TEXT,
    "bannerR2Key" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."episodes" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "episodeNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "duration" INTEGER NOT NULL,
    "videoUrl" TEXT,
    "r2Key" TEXT,
    "r2VideoPath" TEXT,
    "r2SubtitlePath" TEXT,
    "thumbnailUrl" TEXT,
    "thumbnailR2Key" TEXT,
    "r2ThumbnailPath" TEXT,
    "availableQualities" "public"."VideoQuality"[] DEFAULT ARRAY['HD']::"public"."VideoQuality"[],
    "airDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "episodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hero_banners" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "backgroundImage" TEXT NOT NULL,
    "logo" TEXT,
    "type" TEXT NOT NULL DEFAULT 'anime',
    "year" INTEGER NOT NULL,
    "rating" TEXT NOT NULL DEFAULT '16+',
    "duration" TEXT NOT NULL DEFAULT '24 min',
    "episode" TEXT,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "animeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "checkout_sessions_stripeSessionId_key" ON "public"."checkout_sessions"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "animes_slug_key" ON "public"."animes"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "seasons_animeId_seasonNumber_key" ON "public"."seasons"("animeId", "seasonNumber");

-- CreateIndex
CREATE UNIQUE INDEX "episodes_seasonId_episodeNumber_key" ON "public"."episodes"("seasonId", "episodeNumber");

-- AddForeignKey
ALTER TABLE "public"."checkout_sessions" ADD CONSTRAINT "checkout_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."checkout_sessions" ADD CONSTRAINT "checkout_sessions_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."watch_history" ADD CONSTRAINT "watch_history_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "public"."animes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorites" ADD CONSTRAINT "favorites_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "public"."animes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seasons" ADD CONSTRAINT "seasons_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "public"."animes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."episodes" ADD CONSTRAINT "episodes_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "public"."seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hero_banners" ADD CONSTRAINT "hero_banners_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "public"."animes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
