-- AlterTable
ALTER TABLE "TiffinService" DROP COLUMN "mealComponents",
DROP COLUMN "mealSizes",
DROP COLUMN "pricePerMeal",
DROP COLUMN "pricePerMonth";

-- DropEnum
DROP TYPE "MealComponent";

-- DropEnum
DROP TYPE "MealSize";

-- CreateTable
CREATE TABLE "TiffinOffering" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "sizeName" TEXT NOT NULL,
    "mealComponents" TEXT[],
    "pricePerMeal" INTEGER,
    "pricePerMonth" INTEGER,
    "searchPricePerMeal" INTEGER,
    "searchPricePerMonth" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TiffinOffering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelemetryEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "searchQuery" TEXT,
    "city" TEXT,
    "listingId" TEXT,
    "listingSlug" TEXT,
    "ctaName" TEXT,
    "filterName" TEXT,
    "filterValue" TEXT,
    "durationSec" INTEGER,
    "rating" INTEGER,
    "deviceType" TEXT,
    "ipHash" TEXT,
    "country" TEXT,
    "geoCity" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelemetryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TiffinOffering_serviceId_sortOrder_idx" ON "TiffinOffering"("serviceId", "sortOrder");

-- CreateIndex
CREATE INDEX "TelemetryEvent_eventType_createdAt_idx" ON "TelemetryEvent"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "TelemetryEvent_pathname_createdAt_idx" ON "TelemetryEvent"("pathname", "createdAt");

-- CreateIndex
CREATE INDEX "TelemetryEvent_listingId_eventType_idx" ON "TelemetryEvent"("listingId", "eventType");

-- CreateIndex
CREATE INDEX "TelemetryEvent_sessionId_idx" ON "TelemetryEvent"("sessionId");

-- AddForeignKey
ALTER TABLE "TiffinOffering" ADD CONSTRAINT "TiffinOffering_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "TiffinService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
