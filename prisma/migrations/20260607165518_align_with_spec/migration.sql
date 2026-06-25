/*
  Warnings:

  - The values [PLASTIC,THERMAL] on the enum `ContainerType` will be removed. If these variants are still used in the database, this will fail.
  - The values [SABZI,PICKLE,PAPAD,RAITA,SOUP] on the enum `MealComponent` will be removed. If these variants are still used in the database, this will fail.
  - The values [SMALL,MEDIUM,LARGE] on the enum `MealSize` will be removed. If these variants are still used in the database, this will fail.
  - The values [VEGETARIAN,NON_VEGETARIAN,VEGAN,EGGETARIAN] on the enum `MealType` will be removed. If these variants are still used in the database, this will fail.
  - The values [MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY,SUNDAY] on the enum `OperationalDay` will be removed. If these variants are still used in the database, this will fail.
  - The values [EXTRA_SPICY] on the enum `SpiceLevel` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `comment` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `altText` on the `ReviewImage` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `ReviewImage` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `ServiceImage` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `ServiceImage` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `TiffinService` table. All the data in the column will be lost.
  - You are about to drop the column `customizable` on the `TiffinService` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `TiffinService` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `TiffinService` table. All the data in the column will be lost.
  - You are about to drop the column `pincode` on the `TiffinService` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerDay` on the `TiffinService` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `TiffinService` table. All the data in the column will be lost.
  - You are about to drop the column `submittedById` on the `TiffinService` table. All the data in the column will be lost.
  - You are about to drop the column `submittedByIp` on the `TiffinService` table. All the data in the column will be lost.
  - You are about to drop the column `trialAvailable` on the `TiffinService` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `TiffinService` table. All the data in the column will be lost.
  - Added the required column `publicUrl` to the `ReviewImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `r2Key` to the `ReviewImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicUrl` to the `ServiceImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `r2Key` to the `ServiceImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `whatsappNumber` to the `TiffinService` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ContainerType_new" AS ENUM ('STEEL', 'DISPOSABLE');
ALTER TABLE "TiffinService" ALTER COLUMN "containerType" TYPE "ContainerType_new" USING ("containerType"::text::"ContainerType_new");
ALTER TYPE "ContainerType" RENAME TO "ContainerType_old";
ALTER TYPE "ContainerType_new" RENAME TO "ContainerType";
DROP TYPE "public"."ContainerType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "MealComponent_new" AS ENUM ('ROTI', 'SABJI', 'RICE', 'DAL', 'SALAD', 'DESSERT', 'OTHER');
ALTER TYPE "MealComponent" RENAME TO "MealComponent_old";
ALTER TYPE "MealComponent_new" RENAME TO "MealComponent";
DROP TYPE "public"."MealComponent_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "MealSize_new" AS ENUM ('FULL', 'HALF');
ALTER TYPE "MealSize" RENAME TO "MealSize_old";
ALTER TYPE "MealSize_new" RENAME TO "MealSize";
DROP TYPE "public"."MealSize_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "MealType_new" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER');
ALTER TYPE "MealType" RENAME TO "MealType_old";
ALTER TYPE "MealType_new" RENAME TO "MealType";
DROP TYPE "public"."MealType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "OperationalDay_new" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');
ALTER TYPE "OperationalDay" RENAME TO "OperationalDay_old";
ALTER TYPE "OperationalDay_new" RENAME TO "OperationalDay";
DROP TYPE "public"."OperationalDay_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "SpiceLevel_new" AS ENUM ('MILD', 'MEDIUM', 'SPICY');
ALTER TABLE "TiffinService" ALTER COLUMN "spiceLevel" TYPE "SpiceLevel_new" USING ("spiceLevel"::text::"SpiceLevel_new");
ALTER TYPE "SpiceLevel" RENAME TO "SpiceLevel_old";
ALTER TYPE "SpiceLevel_new" RENAME TO "SpiceLevel";
DROP TYPE "public"."SpiceLevel_old";
COMMIT;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "comment",
ADD COLUMN     "body" TEXT,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ReviewImage" DROP COLUMN "altText",
DROP COLUMN "url",
ADD COLUMN     "publicUrl" TEXT NOT NULL,
ADD COLUMN     "r2Key" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ServiceImage" DROP COLUMN "order",
DROP COLUMN "url",
ADD COLUMN     "publicUrl" TEXT NOT NULL,
ADD COLUMN     "r2Key" TEXT NOT NULL,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TiffinService" DROP COLUMN "address",
DROP COLUMN "customizable",
DROP COLUMN "email",
DROP COLUMN "phone",
DROP COLUMN "pincode",
DROP COLUMN "pricePerDay",
DROP COLUMN "state",
DROP COLUMN "submittedById",
DROP COLUMN "submittedByIp",
DROP COLUMN "trialAvailable",
DROP COLUMN "website",
ADD COLUMN     "adminNote" TEXT,
ADD COLUMN     "area" TEXT,
ADD COLUMN     "hasNonVeg" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVegetarian" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pricePerMeal" INTEGER,
ADD COLUMN     "pricePerMonth" INTEGER,
ADD COLUMN     "requiresTiffinWash" BOOLEAN,
ADD COLUMN     "submitterIp" TEXT,
ADD COLUMN     "submitterNote" TEXT,
ADD COLUMN     "whatsappNumber" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Review_serviceId_idx" ON "Review"("serviceId");

-- CreateIndex
CREATE INDEX "ServiceImage_serviceId_sortOrder_idx" ON "ServiceImage"("serviceId", "sortOrder");
