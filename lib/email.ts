import nodemailer from "nodemailer";

interface OrderItem {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  productName?: string | null;
  productImage?: string | null;
  selectedSize?: string | null;
  selectedColor?: string | null;
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  customerAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: parseInt(process.env.MAILTRAP_PORT || "2525"),
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });
};

const sendEmailWithRetry = async (
  mailOptions: any,
  maxRetries = 1
): Promise<boolean> => {
  const transporter = createTransporter();

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(
        `Email sent successfully to ${mailOptions.to} (attempt ${attempt + 1})`
      );
      return true;
    } catch (error) {
      console.error(`Email sending failed (attempt ${attempt + 1}):`, error);

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  console.error(
    `Failed to send email to ${mailOptions.to} after ${maxRetries + 1} attempts`
  );
  return false;
};

const formatOrderItems = (items: OrderEmailData["items"]): string => {
  return items
    .map((item, index) => {
      let itemText = `${index + 1}. ${item.productName || "Product"}`;

      if (item.selectedSize && item.selectedSize !== "Std") {
        itemText += `\n   Size: ${item.selectedSize}`;
      }

      if (item.selectedColor && item.selectedColor !== "Default") {
        itemText += `\n   Color: ${item.selectedColor}`;
      }

      itemText += `\n   Quantity: ${item.quantity}`;
      itemText += `\n   Price: $${item.price.toFixed(2)}`;

      return itemText;
    })
    .join("\n\n");
};

export const sendOrderConfirmation = async (
  data: OrderEmailData
): Promise<void> => {
  const subject = `Order Confirmation #${data.orderNumber}`;

  const text = `
Dear ${data.customerName},

Thank you for your order! Your payment has been processed successfully.

ORDER DETAILS:
Order Number: ${data.orderNumber}

ITEMS ORDERED:
${formatOrderItems(data.items)}

Total: $${data.total.toFixed(2)}

SHIPPING ADDRESS:
${data.customerAddress.address}
${data.customerAddress.city}, ${data.customerAddress.state} ${
    data.customerAddress.zipCode
  }

Your order is being processed and you will receive a shipping confirmation once your items are dispatched.

Thank you for shopping with us!

Best regards,
E-commerce Flow Team
  `.trim();

  const mailOptions = {
    from: "noreply@ecommerce-flow",
    to: data.customerEmail,
    subject,
    text,
  };

  await sendEmailWithRetry(mailOptions);
};

export const sendPaymentDeclined = async (
  data: OrderEmailData
): Promise<void> => {
  const subject = `Payment Declined - Order #${data.orderNumber}`;

  const text = `
Dear ${data.customerName},

We were unable to process your payment for the following order:

ORDER DETAILS:
Order Number: ${data.orderNumber}

ITEMS ORDERED:
${formatOrderItems(data.items)}

Total: $${data.total.toFixed(2)}

REASON: Your payment was declined by your bank or card issuer.

NEXT STEPS:
- Please check your card details and try again
- Ensure you have sufficient funds available
- Contact your bank if the issue persists
- Try using a different payment method

You can retry your purchase by visiting our website and going through the checkout process again.

If you continue to experience issues, please contact our support team.

Best regards,
E-commerce Flow Team
  `.trim();

  const mailOptions = {
    from: "noreply@ecommerce-flow",
    to: data.customerEmail,
    subject,
    text,
  };

  await sendEmailWithRetry(mailOptions);
};

export const sendGatewayError = async (data: OrderEmailData): Promise<void> => {
  const subject = `Payment Error - Order #${data.orderNumber}`;

  const text = `
Dear ${data.customerName},

We encountered a technical issue while processing your payment for the following order:

ORDER DETAILS:
Order Number: ${data.orderNumber}

ITEMS ORDERED:
${formatOrderItems(data.items)}

Total: $${data.total.toFixed(2)}

REASON: A technical error occurred with our payment gateway.

NEXT STEPS:
- Please wait a few minutes and try your purchase again
- If the issue persists, please contact our support team immediately
- We apologize for any inconvenience caused

Our technical team has been notified of this issue and is working to resolve it.

For immediate assistance, please contact:
- Support Email: support@ecommerce-flow
- Support Phone: 1-800-SUPPORT

Best regards,
E-commerce Flow Team
  `.trim();

  const mailOptions = {
    from: "noreply@ecommerce-flow",
    to: data.customerEmail,
    subject,
    text,
  };

  await sendEmailWithRetry(mailOptions);
};
