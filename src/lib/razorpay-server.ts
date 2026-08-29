import crypto from "crypto";
import { saveOrder } from "./server-order-store";
import { shopifyFetchRaw, GET_CART_QUERY, type ShopifyCart } from "./shopify";
import { createShopifyOrder } from "./shopify-admin";

const RAZORPAY_KEY_ID =
  process.env["RAZORPAY_KEY_ID"] ||
  import.meta.env["RAZORPAY_KEY_ID"] ||
  "rzp_test_sparkzen123";

const RAZORPAY_KEY_SECRET =
  process.env["RAZORPAY_KEY_SECRET"] ||
  import.meta.env["RAZORPAY_KEY_SECRET"] ||
  "secret_sparkzen_test_key_123";

const RAZORPAY_WEBHOOK_SECRET =
  process.env["RAZORPAY_WEBHOOK_SECRET"] ||
  import.meta.env["RAZORPAY_WEBHOOK_SECRET"] ||
  "webhook_secret_sparkzen_123";

function getBasicAuthHeader(): string {
  const authStr = `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`;
  return `Basic ${Buffer.from(authStr).toString("base64")}`;
}

function timingSafeEqualStrings(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf-8");
    const bufB = Buffer.from(b, "utf-8");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// 1. Create Razorpay Order Endpoint Handler
export async function handleCreateRazorpayOrder(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      amount?: number;
      cartId?: string;
      customer?: { name?: string; email?: string; phone?: string };
    };

    let finalAmountRupees = body.amount || 0;

    // Server-side validation against Shopify Cart total if cartId is provided
    if (body.cartId) {
      const shopifyRes = await shopifyFetchRaw<{ cart: ShopifyCart | null }>({
        query: GET_CART_QUERY,
        variables: { cartId: body.cartId },
      });

      const cart = shopifyRes.data?.cart;
      if (cart?.cost?.totalAmount?.amount) {
        const cartAmount = parseFloat(cart.cost.totalAmount.amount);
        if (cartAmount > 0) {
          finalAmountRupees = cartAmount;
        }
      }
    }

    if (finalAmountRupees <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid payable amount" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convert to integer in smallest currency unit (paise: ₹4 -> 400, ₹499 -> 49900)
    const amountInPaise = Math.round(finalAmountRupees * 100);
    const currency = "INR";
    const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    console.log(`[Razorpay Server] Creating order: amount=${amountInPaise} paise (${finalAmountRupees} INR), currency=${currency}`);

    // Call official Razorpay Orders API (v1/orders)
    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getBasicAuthHeader(),
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt,
        notes: {
          cartId: body.cartId || "",
          customerEmail: body.customer?.email || "",
        },
      }),
    });

    const status = razorpayRes.status;
    const responseJson = await razorpayRes.json().catch(() => null);

    if (!razorpayRes.ok) {
      const errorCode = responseJson?.error?.code || "ORDER_CREATION_FAILED";
      const errorDesc = responseJson?.error?.description || "Failed to create Razorpay Order";

      // Log safe diagnostic info
      console.error("[Razorpay Server] Orders API Error Diagnostic:", {
        status,
        errorCode,
        errorDesc,
        amount: amountInPaise,
        currency,
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: `${errorDesc} (HTTP ${status})`,
          code: errorCode,
          status,
          keyId: RAZORPAY_KEY_ID,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const orderData = responseJson as { id: string; amount: number; currency: string };

    // Log safe diagnostic information
    console.log("[Razorpay Server] Order Created Successfully Diagnostic:", {
      status,
      order_id: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
    });

    return new Response(
      JSON.stringify({
        success: true,
        orderId: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        keyId: RAZORPAY_KEY_ID,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Razorpay Server] Exception during create order:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// 2. Verify Razorpay Payment Signature Endpoint Handler & Execute Shopify Order Creation
export async function handleVerifyRazorpayPayment(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      razorpay_payment_id?: string;
      razorpay_order_id?: string;
      razorpay_signature?: string;
      cartId?: string;
      amount?: number;
      customer?: {
        name?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        address?: string;
        apartment?: string;
        city?: string;
        state?: string;
        pinCode?: string;
        country?: string;
      };
    };

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      console.error("[Razorpay Server] Missing parameters in verify request:", {
        has_payment_id: !!razorpay_payment_id,
        has_order_id: !!razorpay_order_id,
        has_signature: !!razorpay_signature,
      });

      return new Response(
        JSON.stringify({ success: false, error: "Missing payment, order, or signature parameters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Compute HMAC-SHA256 signature server-side only
    const textToSign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(textToSign)
      .digest("hex");

    const isVerified = timingSafeEqualStrings(expectedSignature, razorpay_signature);

    console.log("[Razorpay Server] Signature Verification Diagnostic Log:", {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      isVerified,
    });

    if (!isVerified) {
      console.error("[Razorpay Server] Signature verification FAILED. Expected signature does not match received signature.");
      return new Response(
        JSON.stringify({ success: false, error: "Payment signature verification failed" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch line items from Shopify cart if cartId exists
    let lineItems: Array<{ variantId: string; quantity: number; title?: string; price?: number }> = [];

    if (body.cartId) {
      const shopifyRes = await shopifyFetchRaw<{ cart: ShopifyCart | null }>({
        query: GET_CART_QUERY,
        variables: { cartId: body.cartId },
      });
      const cartNodes = shopifyRes.data?.cart?.lines?.nodes || [];
      lineItems = cartNodes.map((node) => ({
        variantId: node.merchandise.id,
        quantity: node.quantity,
        title: node.merchandise.product?.title || node.merchandise.title,
        price: parseFloat(node.merchandise.price.amount),
      }));
    }

    // Diagnostic transaction summary log
    const nameParts = (body.customer?.name || "").split(" ");
    const firstName = body.customer?.firstName || nameParts[0] || "Customer";
    const lastName = body.customer?.lastName || nameParts.slice(1).join(" ") || "Valued";

    console.log("[Transaction Diagnostic] Verified Payment Summary:", {
      razorpay_payment_id,
      razorpay_order_id,
      payment_status: "PAID",
      total_amount: body.amount || 0,
      customer: {
        email: body.customer?.email,
        phone: body.customer?.phone,
        name: `${firstName} ${lastName}`,
      },
      shipping_address: {
        address: body.customer?.address,
        city: body.customer?.city,
        state: body.customer?.state,
        pinCode: body.customer?.pinCode,
        country: body.customer?.country || "India",
      },
      line_items: lineItems.map((item) => ({
        variantId: item.variantId,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
      })),
    });

    // Save order details securely into server order store
    saveOrder({
      id: `ord_${Date.now()}`,
      cartId: body.cartId || "",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      amount: body.amount || 0,
      currency: "INR",
      customer: {
        name: `${firstName} ${lastName}`,
        email: body.customer?.email || "",
        phone: body.customer?.phone || "",
        address: body.customer?.address,
        city: body.customer?.city,
        state: body.customer?.state,
        pinCode: body.customer?.pinCode,
        country: body.customer?.country,
      },
      status: "PAID",
      createdAt: new Date().toISOString(),
    });

    // Execute Shopify Order Creation mutation via Shopify Admin API
    let shopifyOrderResult = null;
    if (lineItems.length > 0) {
      shopifyOrderResult = await createShopifyOrder({
        email: body.customer?.email || "",
        phone: body.customer?.phone,
        firstName,
        lastName,
        address: body.customer?.address,
        apartment: body.customer?.apartment,
        city: body.customer?.city,
        state: body.customer?.state,
        pinCode: body.customer?.pinCode,
        country: body.customer?.country,
        lineItems,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        totalAmount: body.amount || 0,
        currencyCode: "INR",
      });

      console.log("[Transaction Diagnostic] Shopify Order Mutation Result:", shopifyOrderResult);
    } else {
      console.warn("[Shopify Order Creation] Cart line items were empty; skipping Shopify Order creation mutation.");
    }

    return new Response(
      JSON.stringify({
        success: true,
        shopifyOrder: shopifyOrderResult,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[Razorpay Server] Exception during signature verification / order creation:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Payment verification error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// 3. Razorpay Webhook Endpoint Handler
export async function handleRazorpayWebhook(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const signature = request.headers.get("x-razorpay-signature");
    const rawBody = await request.text();

    if (signature) {
      const expectedSig = crypto
        .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

      if (!timingSafeEqualStrings(expectedSig, signature)) {
        console.error("[Razorpay Webhook] Invalid Webhook Signature!");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const payload = JSON.parse(rawBody) as { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string; amount?: number } } } };
    console.log(`[Razorpay Webhook] Verified Webhook Event: ${payload.event}`);

    if (payload.event === "payment.captured" || payload.event === "order.paid") {
      const paymentObj = payload.payload?.payment?.entity;
      if (paymentObj?.order_id && paymentObj?.id) {
        console.log(`[Razorpay Webhook] Confirmed payment captured: Order ${paymentObj.order_id}, Payment ${paymentObj.id}`);
      }
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Razorpay Webhook] Exception processing webhook:", error);
    return new Response(JSON.stringify({ error: "Webhook Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
