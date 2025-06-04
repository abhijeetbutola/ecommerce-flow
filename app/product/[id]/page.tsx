"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { getProductById, type ApiProduct } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Star, Package, Info, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ProductReviews from "@/components/product-reviews";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addToCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";

const SIZES = ["Std", "S", "M", "L", "XL"];
const COLORS = ["Default", "Black", "White", "Blue", "Red"];

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { toast } = useToast();

  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("Std");
  const [selectedColor, setSelectedColor] = useState<string>("Default");

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      const fetchedProduct = await getProductById(productId);
      setProduct(fetchedProduct);
      if (fetchedProduct) {
        const firstImage =
          fetchedProduct.images && fetchedProduct.images.length > 0
            ? fetchedProduct.images[0]
            : null;
        setSelectedImage(firstImage || fetchedProduct.thumbnail || "");
        setQuantity(fetchedProduct.minimumOrderQuantity || 1);
      }
      setIsLoading(false);
    }
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      productId: product.id.toString(),
      productName: product.title,
      productImage:
        product.thumbnail || (product.images && product.images[0]) || "",
      price: product.price,
      quantity,
      selectedSize,
      selectedColor,
      stock: product.stock,
      minimumOrderQuantity: product.minimumOrderQuantity,
    });

    toast({
      title: "Added to Cart",
      description: `${product.title} (${quantity}) has been added to your cart.`,
    });
  };

  if (isLoading && !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <p className="text-muted-foreground">
            The product you are looking for does not exist or could not be
            loaded.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6 text-sm"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="grid lg:grid-cols-2 gap-8 xl:gap-12">
        <div>
          <div className="relative aspect-square w-full border rounded-lg overflow-hidden shadow-sm">
            <Image
              src={
                selectedImage ||
                `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(
                  product.title
                )}`
              }
              alt={product.title}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="mt-3 flex space-x-2 overflow-x-auto p-1">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`flex-shrink-0 w-20 h-20 relative rounded border overflow-hidden transition-all duration-150 ease-in-out
                                ${
                                  selectedImage === img
                                    ? "border-primary ring-2 ring-primary ring-offset-1"
                                    : "border-gray-200 hover:border-gray-400"
                                }`}
                >
                  <Image
                    src={img || "/placeholder.svg"}
                    alt={`${product.title} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
            {product.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Brand:{" "}
            <span className="font-medium text-foreground">{product.brand}</span>{" "}
            | Category:{" "}
            <span className="font-medium text-foreground">
              {product.category}
            </span>
          </p>

          <div className="flex items-center mt-3">
            <div className="flex items-center">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.round(product.rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-muted-foreground">
              {product.rating.toFixed(1)} ({product.reviews.length} reviews)
            </span>
          </div>

          <p className="text-3xl font-semibold mt-4 mb-1">
            {formatCurrency(product.price)}
          </p>
          {product.discountPercentage > 0 && (
            <div className="flex items-baseline gap-2 text-sm">
              <p className="text-muted-foreground line-through">
                {formatCurrency(
                  product.price / (1 - product.discountPercentage / 100)
                )}
              </p>
              <p className="text-red-500 font-medium">
                ({product.discountPercentage.toFixed(0)}% off)
              </p>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <div className="flex items-center text-sm">
              <Package className="w-4 h-4 mr-2 text-muted-foreground" />
              Availability:{" "}
              <span
                className={`ml-1 font-semibold ${
                  product.availabilityStatus === "In Stock"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {product.availabilityStatus} ({product.stock} left)
              </span>
            </div>
            {product.shippingInformation && (
              <div className="flex items-center text-sm">
                <Info className="w-4 h-4 mr-2 text-muted-foreground" />
                {product.shippingInformation}
              </div>
            )}
          </div>

          <Separator className="my-6" />

          <div className="mb-4">
            <Label className="text-sm font-medium mb-2 block">
              Size:{" "}
              <span className="text-foreground font-semibold">
                {selectedSize}
              </span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  onClick={() => setSelectedSize(size)}
                  size="sm"
                  className="min-w-[4rem]"
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <Label className="text-sm font-medium mb-2 block">
              Color:{" "}
              <span className="text-foreground font-semibold">
                {selectedColor}
              </span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <Button
                  key={color}
                  variant={selectedColor === color ? "default" : "outline"}
                  onClick={() => setSelectedColor(color)}
                  size="sm"
                  className="min-w-[5rem]"
                >
                  {color}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <Label htmlFor="quantity" className="text-sm font-medium">
              Quantity
            </Label>
            <Select
              value={quantity.toString()}
              onValueChange={(value) => {
                const newQuantity = Number.parseInt(value);
                const minOrder = product.minimumOrderQuantity || 1;
                setQuantity(
                  Math.max(
                    newQuantity,
                    newQuantity >= minOrder ? newQuantity : minOrder
                  )
                );
              }}
              disabled={
                product.stock === 0 || product.availabilityStatus !== "In Stock"
              }
            >
              <SelectTrigger className="w-28 mt-1.5 h-10">
                <SelectValue placeholder="Qty" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  { length: Math.min(product.stock, 10) },
                  (_, i) => i + (product.minimumOrderQuantity || 1)
                )
                  .filter((qty) => qty <= product.stock)
                  .map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {product.minimumOrderQuantity > 1 &&
              quantity < product.minimumOrderQuantity &&
              product.stock > 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Minimum order quantity is {product.minimumOrderQuantity}.
                </p>
              )}
          </div>

          <Button
            size="lg"
            className="w-full h-12 text-base"
            disabled={
              product.stock === 0 ||
              quantity > product.stock ||
              product.availabilityStatus !== "In Stock" ||
              quantity < (product.minimumOrderQuantity || 1)
            }
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {product.availabilityStatus !== "In Stock" || product.stock === 0
              ? "Out of Stock"
              : "Add to Cart"}
          </Button>

          {product.tags && product.tags.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Tabs defaultValue="description" className="mt-10 lg:mt-12">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-1">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({product.reviews.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="py-6 px-1">
          <h2 className="text-xl font-semibold mb-3">Product Description</h2>
          <article className="prose prose-sm max-w-none text-gray-700">
            {product.description}
          </article>
        </TabsContent>
        <TabsContent value="details" className="py-6 px-1">
          <h2 className="text-xl font-semibold mb-4">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <p>
              <strong>SKU:</strong> {product.sku}
            </p>
            <p>
              <strong>Weight:</strong> {product.weight}g
            </p>
            <p>
              <strong>Dimensions (WxHxD):</strong> {product.dimensions.width} x{" "}
              {product.dimensions.height} x {product.dimensions.depth} cm
            </p>
            <p>
              <strong>Warranty:</strong> {product.warrantyInformation}
            </p>
            <p>
              <strong>QR Code:</strong>{" "}
              <a
                href={product.meta.qrCode}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View QR
              </a>
            </p>
            <p>
              <strong>Barcode:</strong> {product.meta.barcode}
            </p>
          </div>
        </TabsContent>
        <TabsContent value="shipping" className="py-6 px-1">
          <h2 className="text-xl font-semibold mb-3">Shipping & Returns</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>Shipping:</strong> {product.shippingInformation}
            </p>
            <p>
              <strong>Returns:</strong> {product.returnPolicy}
            </p>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="py-6 px-1">
          <h2 className="text-xl font-semibold mb-6">Customer Reviews</h2>
          <ProductReviews reviews={product.reviews} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
