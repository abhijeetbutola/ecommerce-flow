"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

type OrderDetailsFromApi = {
  id: string;
  orderNumber: string;
  status: "approved" | "declined" | "error";
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  productId: string;
  quantity: number;
  total: number;
  createdAt: string;
  productName?: string;
  productImage?: string;
  selectedSize?: string;
  selectedColor?: string;
};

function ThankYouContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  const [orderDetails, setOrderDetails] = useState<OrderDetailsFromApi | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) {
      setError("Order number not found in URL.");
      setIsLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/orders/${orderNumber}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Failed to fetch order details: ${response.statusText}`
          );
        }
        const data = await response.json();
        setOrderDetails(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load order details."
        );
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderNumber, router]);

  if (isLoading) {
    return <div className="text-center py-10">Loading order details...</div>;
  }

  if (error || !orderDetails) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent className="pt-6 text-center space-y-4">
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="text-2xl font-bold">Error</h1>
          <p>{error || "Order not found or could not be loaded."}</p>
          <Button onClick={() => router.push("/")}>Return to Home</Button>
        </CardContent>
      </Card>
    );
  }

  const StatusIcon = () => {
    if (orderDetails.status === "approved")
      return <CheckCircle className="h-12 w-12 text-green-500" />;
    if (orderDetails.status === "declined")
      return <XCircle className="h-12 w-12 text-red-500" />;
    return <AlertTriangle className="h-12 w-12 text-amber-500" />;
  };

  const StatusMessage = () => {
    if (orderDetails.status === "approved") {
      return (
        <>
          <h1 className="text-2xl font-bold text-green-600">
            Order Confirmed!
          </h1>
          <p>
            Thank you for your purchase. A confirmation email has been sent to{" "}
            {orderDetails.customerInfo.email}.
          </p>
        </>
      );
    }
    if (orderDetails.status === "declined") {
      return (
        <>
          <h1 className="text-2xl font-bold text-red-600">Payment Declined</h1>
          <p>
            Your payment was declined. Please check your payment details or
            contact support.
          </p>
        </>
      );
    }
    return (
      <>
        <h1 className="text-2xl font-bold text-amber-600">Payment Error</h1>
        <p>
          We encountered an error processing your payment. Please try again or
          contact support.
        </p>
      </>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="mb-6">
        <CardContent className="pt-6 flex flex-col items-center space-y-4">
          <StatusIcon />
          <div className="text-center space-y-2">
            <StatusMessage />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderDetails.productImage && orderDetails.productName && (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 relative rounded border overflow-hidden">
                  <Image
                    src={orderDetails.productImage || "/placeholder.svg"}
                    alt={orderDetails.productName}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div>
                  <p className="font-medium">{orderDetails.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {orderDetails.quantity}
                  </p>
                  {orderDetails.selectedSize &&
                    orderDetails.selectedSize !== "Std" && (
                      <p className="text-xs text-muted-foreground">
                        Size: {orderDetails.selectedSize}
                      </p>
                    )}
                  {orderDetails.selectedColor &&
                    orderDetails.selectedColor !== "Default" && (
                      <p className="text-xs text-muted-foreground">
                        Color: {orderDetails.selectedColor}
                      </p>
                    )}
                </div>
              </div>
            )}
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-medium">{orderDetails.orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">
                {new Date(orderDetails.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p
                className={`font-medium ${
                  orderDetails.status === "approved"
                    ? "text-green-600"
                    : orderDetails.status === "declined"
                    ? "text-red-600"
                    : "text-amber-600"
                }`}
              >
                {orderDetails.status.charAt(0).toUpperCase() +
                  orderDetails.status.slice(1)}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="font-medium text-lg">
                {formatCurrency(orderDetails.total)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">
                {orderDetails.customerInfo.fullName}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{orderDetails.customerInfo.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{orderDetails.customerInfo.phone}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Shipping Address</p>
              <p className="font-medium">{orderDetails.customerInfo.address}</p>
              <p className="font-medium">
                {orderDetails.customerInfo.city},{" "}
                {orderDetails.customerInfo.state}{" "}
                {orderDetails.customerInfo.zipCode}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 text-center">
        <Button onClick={() => router.push("/")}>Continue Shopping</Button>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense
        fallback={
          <div className="text-center py-10">Loading order details...</div>
        }
      >
        <ThankYouContent />
      </Suspense>
    </div>
  );
}
