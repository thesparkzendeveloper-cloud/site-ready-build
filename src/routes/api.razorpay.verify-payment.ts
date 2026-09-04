import { handleVerifyRazorpayPayment } from "@/lib/razorpay-server";

export async function POST({ request }: { request: Request }) {
  return await handleVerifyRazorpayPayment(request);
}
