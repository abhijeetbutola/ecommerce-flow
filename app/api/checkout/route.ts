import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/lib/db";
import {
  sendGatewayError,
  sendOrderConfirmation,
  sendPaymentDeclined,
} from "@/lib/email";
import { OrderItem } from "@/lib/generated/prisma";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const { customerInfo, paymentInfo, items, total } = data;

    let status: OrderStatus;
    const cardStart = paymentInfo.cardNumber.charAt(0);

    if (cardStart === "1") status = "approved";
    else if (cardStart === "2") status = "declined";
    else if (cardStart === "3") status = "error";
    else status = "approved";

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(
      Math.random() * 1000
    )
      .toString()
      .padStart(3, "0")}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status,
        customerInfo,
        paymentInfo,
        total,
        items: {
          create: (items as OrderItem[]).map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            productName: item.productName,
            productImage: item.productImage,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    const emailData = {
      orderNumber,
      customerName: customerInfo.fullName,
      customerEmail: customerInfo.email,
      items: order.items,
      total,
      customerAddress: {
        address: customerInfo.address,
        city: customerInfo.city,
        state: customerInfo.state,
        zipCode: customerInfo.zipCode,
      },
    };

    Promise.resolve().then(async () => {
      try {
        switch (status) {
          case "approved":
            await sendOrderConfirmation(emailData);
            break;
          case "declined":
            await sendPaymentDeclined(emailData);
            break;
          case "error":
            await sendGatewayError(emailData);
            break;
          default:
            console.log("No email sent for status:", status);
        }
      } catch (emailError) {
        console.error("Email sending error:", emailError);
      }
    });

    return NextResponse.json({
      status,
      orderNumber,
    });
  } catch (err) {
    console.error("Failed to create order:", err);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
