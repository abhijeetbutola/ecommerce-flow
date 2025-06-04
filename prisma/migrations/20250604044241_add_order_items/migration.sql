/*
  Warnings:

  - You are about to drop the column `productId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `productImage` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `productName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `selectedColor` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `selectedSize` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `variantId` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "productId",
DROP COLUMN "productImage",
DROP COLUMN "productName",
DROP COLUMN "quantity",
DROP COLUMN "selectedColor",
DROP COLUMN "selectedSize",
DROP COLUMN "variantId";

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "productName" TEXT,
    "productImage" TEXT,
    "selectedSize" TEXT,
    "selectedColor" TEXT,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
