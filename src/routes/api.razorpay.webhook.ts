import { handleRazorpayWebhook } from "@/lib/razorpay-server";

export async function POST({ request }: { request: Request }) {
  return await handleRazorpayWebhook(request);
}
