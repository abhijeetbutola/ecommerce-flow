export type CustomerInfo = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
};

export type PaymentInfo = {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
};

export type OrderStatus = "approved" | "declined" | "error";

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerInfo: CustomerInfo;
  paymentInfo: PaymentInfo;
  productId: string;
  variantId: string;
  quantity: number;
  total: number;
  createdAt: Date;
  productName?: string;
  productImage?: string;
  selectedSize?: string;
  selectedColor?: string;
};

const orders: Order[] = [];
