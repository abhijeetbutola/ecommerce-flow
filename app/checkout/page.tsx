"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  formatCurrency,
  formatCardNumber,
  formatExpiryDate,
  isValidEmail,
  isValidPhone,
  isValidCardNumber,
  isValidExpiryDate,
  isValidCVV,
  isValidZipCode,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { getCart, getCartSubtotal, clearCart } from "@/lib/cart";
import type { CartItem } from "@/types/cart";

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
};

type FormErrors = {
  [K in keyof FormData]?: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCartLoading, setIsCartLoading] = useState<boolean>(true);

  useEffect(() => {
    const items = getCart();
    if (items.length === 0) {
      router.replace("/cart");
      return;
    }
    setCartItems(items);
    setIsCartLoading(false);
  }, [router]);

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === "cardNumber") {
      formattedValue = formatCardNumber(value);
    } else if (name === "expiryDate") {
      formattedValue = formatExpiryDate(value);
    }
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!isValidEmail(formData.email))
      newErrors.email = "Please enter a valid email";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!isValidPhone(formData.phone))
      newErrors.phone = "Please enter a valid phone number";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "Zip code is required";
    else if (!isValidZipCode(formData.zipCode))
      newErrors.zipCode = "Zip code must be 5 to 7 digits";

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = "Card number is required";
    } else if (!isValidCardNumber(formData.cardNumber)) {
      newErrors.cardNumber =
        "Enter '1', '2', '3' for simulation, or a valid 16-digit card number.";
    }

    if (!formData.expiryDate.trim()) {
      newErrors.expiryDate = "Expiry date is required";
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = "Invalid format, use MM/YY";
    } else {
      const [monthStr, yearStr] = formData.expiryDate.split("/");
      const month = Number.parseInt(monthStr, 10);
      if (isNaN(month) || month < 1 || month > 12) {
        newErrors.expiryDate = "Invalid month in expiry date.";
      } else if (!isValidExpiryDate(formData.expiryDate)) {
        newErrors.expiryDate = "Expiry date cannot be in the past.";
      }
    }
    if (!formData.cvv.trim()) newErrors.cvv = "CVV is required";
    else if (!isValidCVV(formData.cvv))
      newErrors.cvv = "Valid 3-digit CVV required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || cartItems.length === 0) return;

    setIsLoading(true);

    const subtotal = getCartSubtotal(cartItems);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerInfo: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
          },
          paymentInfo: {
            cardNumber: formData.cardNumber.replace(/\s/g, "").slice(-4),
            expiryDate: formData.expiryDate,
          },
          items: cartItems.map((item) => ({
            productId: item.productId,
            variantId: `${item.selectedSize}-${item.selectedColor}`,
            quantity: item.quantity,
            price: item.price,
            productName: item.productName,
            productImage: item.productImage,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
          })),
          total: subtotal,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        clearCart();
        router.push(`/thank-you?orderNumber=${data.orderNumber}`);
      } else {
        throw new Error(data.message || "Checkout failed");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(
        `An error occurred: ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isCartLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Loading checkout...
      </div>
    );
  }

  const subtotal = getCartSubtotal(cartItems);
  const shippingCost = cartItems.length > 0 ? 5.0 : 0;
  const total = subtotal + shippingCost;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push("/cart")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart
      </Button>
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} id="checkout-form">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={errors.fullName ? "border-red-500" : ""}
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm">{errors.fullName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm">{errors.email}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm">{errors.address}</p>
                  )}
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={errors.city ? "border-red-500" : ""}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={errors.state ? "border-red-500" : ""}
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm">{errors.state}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className={errors.zipCode ? "border-red-500" : ""}
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-sm">{errors.zipCode}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    placeholder="Enter 1, 2, or 3 for test"
                    maxLength={19}
                    className={errors.cardNumber ? "border-red-500" : ""}
                  />
                  {errors.cardNumber && (
                    <p className="text-red-500 text-sm">{errors.cardNumber}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter '1' for Approved, '2' for Declined, '3' for Gateway
                    Error.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      className={errors.expiryDate ? "border-red-500" : ""}
                    />
                    {errors.expiryDate && (
                      <p className="text-red-500 text-sm">
                        {errors.expiryDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      maxLength={3}
                      className={errors.cvv ? "border-red-500" : ""}
                    />
                    {errors.cvv && (
                      <p className="text-red-500 text-sm">{errors.cvv}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 relative rounded overflow-hidden border">
                      <Image
                        src={item.productImage || "/placeholder.svg"}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium line-clamp-1">
                        {item.productName}
                      </h3>
                      <p className="text-sm">Qty: {item.quantity}</p>
                      {item.selectedSize && item.selectedSize !== "Std" && (
                        <p className="text-xs text-muted-foreground">
                          Size: {item.selectedSize}
                        </p>
                      )}
                      {item.selectedColor &&
                        item.selectedColor !== "Default" && (
                          <p className="text-xs text-muted-foreground">
                            Color: {item.selectedColor}
                          </p>
                        )}
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>
                    <p className="ml-auto font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatCurrency(shippingCost)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                form="checkout-form"
                className="w-full"
                size="lg"
                disabled={isLoading || cartItems.length === 0}
              >
                {isLoading ? "Processing..." : "Complete Purchase"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
