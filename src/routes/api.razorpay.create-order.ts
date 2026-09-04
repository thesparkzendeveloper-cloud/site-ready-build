import { handleCreateRazorpayOrder } from "@/lib/razorpay-server";

export async function POST({ request }: { request: Request }) {
  return await handleCreateRazorpayOrder(request);
}
