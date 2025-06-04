/*
  Warnings:

  - You are about to drop the column `customerEmail` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `customerInfo` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentInfo` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variantId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";

-- DropIndex
DROP INDEX "Order_orderNumber_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "customerEmail",
DROP COLUMN "customerName",
ADD COLUMN     "customerInfo" JSONB NOT NULL,
ADD COLUMN     "paymentInfo" JSONB NOT NULL,
ADD COLUMN     "productId" TEXT NOT NULL,
ADD COLUMN     "productImage" TEXT,
ADD COLUMN     "productName" TEXT,
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "selectedColor" TEXT,
ADD COLUMN     "selectedSize" TEXT,
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "variantId" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- DropTable
DROP TABLE "OrderItem";

-- DropTable
DROP TABLE "Product";

-- DropEnum
DROP TYPE "OrderStatus";
