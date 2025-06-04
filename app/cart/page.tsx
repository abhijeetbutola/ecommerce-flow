"use client";

import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import {
  getCart,
  updateCartItemQuantity,
  removeFromCart,
  getCartSubtotal,
} from "@/lib/cart";
import type { CartItem } from "@/types/cart";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCartItems(getCart());
    setIsLoading(false);
  }, []);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;

    const minOrder = item.minimumOrderQuantity || 1;
    let quantityToSet = Math.max(newQuantity, 0);

    if (item.stock && quantityToSet > item.stock) {
      quantityToSet = item.stock;
    }

    setCartItems(updateCartItemQuantity(itemId, quantityToSet));
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(removeFromCart(itemId));
  };

  const subtotal = getCartSubtotal(cartItems);
  const shippingCost = cartItems.length > 0 ? 5.0 : 0;
  const total = subtotal + shippingCost;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Loading cart...
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Button asChild size="lg">
          <Link href="/catalog">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item) => (
            <Card key={item.id} className="flex flex-col sm:flex-row gap-4 p-4">
              <div className="w-full sm:w-24 h-24 relative flex-shrink-0 rounded border overflow-hidden">
                <NextImage
                  src={item.productImage || "/placeholder.svg"}
                  alt={item.productName}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              <div className="flex-grow">
                <h2 className="text-lg font-semibold">{item.productName}</h2>
                <p className="text-sm text-muted-foreground">
                  Size: {item.selectedSize} | Color: {item.selectedColor}
                </p>
                <p className="text-sm font-medium mt-1">
                  {formatCurrency(item.price)}
                </p>
              </div>
              <div className="flex flex-col sm:items-end justify-between gap-2 mt-2 sm:mt-0">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`quantity-${item.id}`} className="sr-only">
                    Quantity
                  </Label>
                  <Input
                    id={`quantity-${item.id}`}
                    type="number"
                    min="0"
                    max={item.stock || 99}
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        item.id,
                        Number.parseInt(e.target.value, 10)
                      )
                    }
                    className="w-20 h-9 text-center"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id)}
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <p className="text-md font-semibold text-right">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatCurrency(shippingCost)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  router.push("/checkout");
                }}
              >
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
