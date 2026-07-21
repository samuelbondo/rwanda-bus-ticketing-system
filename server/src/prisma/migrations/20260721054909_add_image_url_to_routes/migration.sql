-- AlterTable
ALTER TABLE "platform_settings" ALTER COLUMN "aiModel" SET DEFAULT 'gemini-2.0-flash';

-- AlterTable
ALTER TABLE "routes" ADD COLUMN     "imageUrl" TEXT;
