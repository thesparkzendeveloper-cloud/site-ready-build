// Shopify Admin API integration for server-side order creation after verified payment

const SHOPIFY_STORE_DOMAIN =
  process.env["VITE_SHOPIFY_STORE_DOMAIN"] ||
  import.meta.env["VITE_SHOPIFY_STORE_DOMAIN"] ||
  "spark-zen-2.myshopify.com";

const SHOPIFY_STOREFRONT_API_VERSION =
  process.env["VITE_SHOPIFY_STOREFRONT_API_VERSION"] ||
  import.meta.env["VITE_SHOPIFY_STOREFRONT_API_VERSION"] ||
  "2026-07";

const SHOPIFY_ADMIN_API_ACCESS_TOKEN =
  process.env["SHOPIFY_ADMIN_API_ACCESS_TOKEN"] ||
  import.meta.env["SHOPIFY_ADMIN_API_ACCESS_TOKEN"] ||
  "";

const ADMIN_GRAPHQL_ENDPOINT = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_STOREFRONT_API_VERSION}/graphql.json`;

export interface CreateShopifyOrderParams {
  email: string;
  phone?: string | undefined;
  firstName: string;
  lastName: string;
  address?: string | undefined;
  apartment?: string | undefined;
  city?: string | undefined;
  state?: string | undefined;
  pinCode?: string | undefined;
  country?: string | undefined;
  lineItems: Array<{
    variantId: string;
    quantity: number;
    title?: string | undefined;
    price?: number | undefined;
  }>;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  totalAmount: number;
  currencyCode?: string | undefined;
}

export interface CreateShopifyOrderResult {
  success: boolean;
  orderId?: string | undefined;
  orderName?: string | undefined;
  orderNumber?: number | undefined;
  error?: string | undefined;
  graphqlErrors?: Array<{ message: string }> | undefined;
  userErrors?: Array<{ field?: string[] | undefined; message: string }> | undefined;
}

const DRAFT_ORDER_CREATE_MUTATION = `
  mutation createDraftOrder($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        name
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const DRAFT_ORDER_COMPLETE_MUTATION = `
  mutation completeDraftOrder($id: ID!) {
    draftOrderComplete(id: $id, paymentPending: false) {
      draftOrder {
        order {
          id
          name
          orderNumber
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function createShopifyOrder(
  params: CreateShopifyOrderParams
): Promise<CreateShopifyOrderResult> {
  console.log("[Shopify Admin] Initiating server-side order creation for verified Razorpay payment:", {
    razorpayPaymentId: params.razorpayPaymentId,
    razorpayOrderId: params.razorpayOrderId,
    lineItemsCount: params.lineItems.length,
    totalAmount: params.totalAmount,
    currency: params.currencyCode || "INR",
    customerEmail: params.email,
  });

  if (!SHOPIFY_ADMIN_API_ACCESS_TOKEN) {
    const errorMsg =
      "SHOPIFY_ADMIN_API_ACCESS_TOKEN is missing in server environment. Order creation cannot proceed without Admin API token.";
    console.error(`[Shopify Admin] Error: ${errorMsg}`);
    return {
      success: false,
      error: errorMsg,
    };
  }

  try {
    // 1. Prepare Draft Order Input
    const draftInput = {
      email: params.email,
      phone: params.phone || undefined,
      shippingAddress: {
        firstName: params.firstName,
        lastName: params.lastName,
        address1: params.address || "Street Address",
        address2: params.apartment || undefined,
        city: params.city || "City",
        province: params.state || "State",
        zip: params.pinCode || "000000",
        country: params.country || "India",
      },
      lineItems: params.lineItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      tags: ["Razorpay", "Paid", "Headless"],
      note: `Paid via Razorpay. Payment ID: ${params.razorpayPaymentId}, Order ID: ${params.razorpayOrderId}`,
      customAttributes: [
        { key: "Razorpay Payment ID", value: params.razorpayPaymentId },
        { key: "Razorpay Order ID", value: params.razorpayOrderId },
        { key: "Payment Status", value: "PAID" },
      ],
    };

    // 2. Execute draftOrderCreate
    const createRes = await fetch(ADMIN_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: DRAFT_ORDER_CREATE_MUTATION,
        variables: { input: draftInput },
      }),
    });

    const createStatus = createRes.status;
    const createJson = (await createRes.json().catch(() => ({}))) as {
      data?: {
        draftOrderCreate?: {
          draftOrder?: { id: string; name: string };
          userErrors?: Array<{ field?: string[]; message: string }>;
        };
      };
      errors?: Array<{ message: string }>;
    };

    if (!createRes.ok || createJson.errors?.length) {
      const graphqlErr = createJson.errors?.[0]?.message || `HTTP ${createStatus}`;
      console.error("[Shopify Admin] draftOrderCreate Failed:", {
        status: createStatus,
        graphqlError: graphqlErr,
      });
      return {
        success: false,
        error: `Shopify GraphQL Error (${createStatus}): ${graphqlErr}`,
        graphqlErrors: createJson.errors,
      };
    }

    const draftData = createJson.data?.draftOrderCreate;
    if (draftData?.userErrors && draftData.userErrors.length > 0) {
      console.error("[Shopify Admin] draftOrderCreate userErrors:", draftData.userErrors);
      return {
        success: false,
        error: draftData.userErrors[0]?.message || "Failed to create draft order",
        userErrors: draftData.userErrors,
      };
    }

    const draftOrderId = draftData?.draftOrder?.id;
    if (!draftOrderId) {
      return {
        success: false,
        error: "Draft Order ID not returned by Shopify",
      };
    }

    console.log(`[Shopify Admin] Draft Order created: ${draftOrderId} (${draftData?.draftOrder?.name}). Completing order...`);

    // 3. Execute draftOrderComplete to finalize as paid Order
    const completeRes = await fetch(ADMIN_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: DRAFT_ORDER_COMPLETE_MUTATION,
        variables: { id: draftOrderId },
      }),
    });

    const completeJson = (await completeRes.json().catch(() => ({}))) as {
      data?: {
        draftOrderComplete?: {
          draftOrder?: {
            order?: {
              id: string;
              name: string;
              orderNumber: number;
            };
          };
          userErrors?: Array<{ field?: string[]; message: string }>;
        };
      };
      errors?: Array<{ message: string }>;
    };

    const orderObj = completeJson.data?.draftOrderComplete?.draftOrder?.order;
    const completeUserErrors = completeJson.data?.draftOrderComplete?.userErrors;

    if (completeUserErrors && completeUserErrors.length > 0) {
      console.error("[Shopify Admin] draftOrderComplete userErrors:", completeUserErrors);
      return {
        success: false,
        error: completeUserErrors[0]?.message || "Failed to complete draft order",
        userErrors: completeUserErrors,
      };
    }

    if (!orderObj?.id) {
      console.error("[Shopify Admin] Order object not returned by draftOrderComplete:", completeJson);
      return {
        success: false,
        error: "Shopify Order ID not returned upon completion",
      };
    }

    console.log("[Shopify Admin] Shopify Order Created & Completed Successfully!", {
      shopifyOrderId: orderObj.id,
      orderName: orderObj.name,
      orderNumber: orderObj.orderNumber,
      razorpayPaymentId: params.razorpayPaymentId,
      totalAmount: params.totalAmount,
    });

    return {
      success: true,
      orderId: orderObj.id,
      orderName: orderObj.name,
      orderNumber: orderObj.orderNumber,
    };
  } catch (err) {
    console.error("[Shopify Admin] Exception creating Shopify Order:", err);
    return {
      success: false,
      error: "Exception during Shopify Order creation",
    };
  }
}
