export interface VerifiedOrder {
  id: string;
  cartId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    pinCode?: string | undefined;
    country?: string | undefined;
  };
  status: "PAID" | "VERIFIED" | "CAPTURED";
  createdAt: string;
}

// Server-side order registry
const orderStore = new Map<string, VerifiedOrder>();

export function saveOrder(order: VerifiedOrder): void {
  orderStore.set(order.razorpayOrderId, order);
  console.log(`[Server Order Store] Saved verified order: ${order.razorpayOrderId} (Payment ID: ${order.razorpayPaymentId})`);
}

export function getOrder(razorpayOrderId: string): VerifiedOrder | undefined {
  return orderStore.get(razorpayOrderId);
}

export function getAllOrders(): VerifiedOrder[] {
  return Array.from(orderStore.values());
}
