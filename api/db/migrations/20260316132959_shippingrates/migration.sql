-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "shippingSurcharge" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "SiteSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key")
);
