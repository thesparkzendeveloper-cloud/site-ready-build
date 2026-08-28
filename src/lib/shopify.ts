// Shopify Storefront API Client

const SHOPIFY_STORE_DOMAIN =
  import.meta.env["VITE_SHOPIFY_STORE_DOMAIN"] || "spark-zen-2.myshopify.com";
const SHOPIFY_STOREFRONT_ACCESS_TOKEN =
  import.meta.env["VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN"] || "eb6d7bc941b1991968b065f1afb77831";
const SHOPIFY_STOREFRONT_API_VERSION =
  import.meta.env["VITE_SHOPIFY_STOREFRONT_API_VERSION"] || "2026-07";

const GRAPHQL_ENDPOINT = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_STOREFRONT_API_VERSION}/graphql.json`;

export interface ShopifyImage {
  url: string;
  altText?: string | null;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice?: {
    amount: string;
    currencyCode: string;
  } | null;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  image?: ShopifyImage | null;
}

export interface ShopifyProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  compareAtPriceRange?: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  } | null;
  featuredImage?: ShopifyImage | null;
  images: {
    nodes: ShopifyImage[];
  };
  collections: {
    nodes: Array<{
      title: string;
      handle: string;
    }>;
  };
  options: ShopifyProductOption[];
  variants: {
    nodes: ShopifyVariant[];
  };
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image?: ShopifyImage | null;
  products?: {
    totalCount: number;
  };
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: {
      amount: string;
      currencyCode: string;
    };
    product: {
      id: string;
      title: string;
      handle: string;
      featuredImage?: ShopifyImage | null;
    };
    selectedOptions: Array<{
      name: string;
      value: string;
    }>;
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: {
    nodes: ShopifyCartLine[];
  };
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
}

export async function shopifyFetch<T>({
  query,
  variables = {},
}: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<T | null> {
  const tokenExists = Boolean(SHOPIFY_STOREFRONT_ACCESS_TOKEN);
  console.log(`[Shopify Client Diagnostics] Endpoint: ${GRAPHQL_ENDPOINT}`);
  console.log(`[Shopify Client Diagnostics] API Version: ${SHOPIFY_STOREFRONT_API_VERSION}`);
  console.log(`[Shopify Client Diagnostics] Public Token Exists: ${tokenExists}`);

  if (!tokenExists) {
    console.warn(
      "[Shopify] VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variable is not defined. Using mock data fallback."
    );
    return null;
  }

  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      console.error(`[Shopify] HTTP error! Status: ${res.status}`);
      return null;
    }

    const json = await res.json();
    if (json.errors) {
      console.error("[Shopify] GraphQL errors:", json.errors);
      return null;
    }

    return json.data as T;
  } catch (error) {
    console.error("[Shopify] Fetch request failed:", error);
    return null;
  }
}

// Queries
const PRODUCTS_QUERY = `
  query getProducts($first: Int = 50) {
    products(first: $first) {
      nodes {
        id
        handle
        title
        description
        productType
        tags
        availableForSale
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        featuredImage {
          url
          altText
        }
        images(first: 10) {
          nodes {
            url
            altText
          }
        }
        collections(first: 5) {
          nodes {
            title
            handle
          }
        }
        options {
          id
          name
          values
        }
        variants(first: 20) {
          nodes {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
            image {
              url
            }
          }
        }
      }
    }
  }
`;

const COLLECTIONS_QUERY = `
  query getCollections($first: Int = 20) {
    collections(first: $first) {
      nodes {
        id
        handle
        title
        description
        image {
          url
          altText
        }
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      productType
      tags
      availableForSale
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      featuredImage {
        url
        altText
      }
      images(first: 10) {
        nodes {
          url
          altText
        }
      }
      collections(first: 5) {
        nodes {
          title
          handle
        }
      }
      options {
        id
        name
        values
      }
      variants(first: 20) {
        nodes {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          image {
            url
          }
        }
      }
    }
  }
`;

// Cart Mutations & Queries
const CART_FRAGMENT = `
  id
  checkoutUrl
  totalQuantity
  lines(first: 50) {
    nodes {
      id
      quantity
      merchandise {
        ... on ProductVariant {
          id
          title
          price {
            amount
            currencyCode
          }
          product {
            id
            title
            handle
            featuredImage {
              url
            }
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
  cost {
    totalAmount {
      amount
      currencyCode
    }
    subtotalAmount {
      amount
      currencyCode
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart {
        ${CART_FRAGMENT}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ${CART_FRAGMENT}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ${CART_FRAGMENT}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ${CART_FRAGMENT}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_QUERY = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ${CART_FRAGMENT}
    }
  }
`;

const CART_CHECKOUT_URL_QUERY = `
  query GetCartCheckoutUrl($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      lines(first: 100) {
        nodes {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
            }
          }
        }
      }
    }
  }
`;

export interface ShopifyFetchResponse<T> {
  status: number;
  data: T | null;
  errors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
  raw?: unknown;
}

export async function shopifyFetchRaw<T>({
  query,
  variables = {},
}: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<ShopifyFetchResponse<T>> {
  const tokenExists = Boolean(SHOPIFY_STOREFRONT_ACCESS_TOKEN);
  console.log(`[Shopify Client Diagnostics] Endpoint: ${GRAPHQL_ENDPOINT}`);
  console.log(`[Shopify Client Diagnostics] API Version: ${SHOPIFY_STOREFRONT_API_VERSION}`);
  console.log(`[Shopify Client Diagnostics] Public Token Provided: ${tokenExists}`);

  if (!tokenExists) {
    console.warn("[Shopify Client Diagnostics] VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN is missing.");
    return { status: 0, data: null };
  }

  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    console.log(`[Shopify Client Diagnostics] HTTP Status: ${res.status}`);

    const json = await res.json().catch(() => null);

    if (json?.errors) {
      console.error("[Shopify Client Diagnostics] GraphQL errors:", JSON.stringify(json.errors, null, 2));
    }

    return {
      status: res.status,
      data: (json?.data as T) || null,
      errors: json?.errors,
      raw: json,
    };
  } catch (error) {
    console.error("[Shopify Client Diagnostics] Fetch Exception:", error);
    return { status: 0, data: null };
  }
}

export interface ShopifyCartCheckoutDiagnosis {
  status: number;
  errors?: Array<{ message: string; extensions?: Record<string, unknown> }> | undefined;
  userErrors?: Array<{ field?: string[]; message: string }> | undefined;
  cartExists: boolean;
  cartId: string | null;
  lineCount: number;
  checkoutUrl: string | null;
  hostname: string | null;
  pathname: string | null;
  rawResponse?: unknown;
}

export async function diagnoseShopifyCartCheckoutUrl(
  cartId: string
): Promise<ShopifyCartCheckoutDiagnosis> {
  console.log(`[Shopify Cart Diagnosis] Querying Cart ID: ${cartId}`);
  const response = await shopifyFetchRaw<{
    cart: {
      id: string;
      checkoutUrl: string | null;
      lines: { nodes: Array<{ id: string; quantity: number }> };
    } | null;
  }>({
    query: CART_CHECKOUT_URL_QUERY,
    variables: { cartId },
  });

  const cart = response.data?.cart || null;
  const cartExists = Boolean(cart);
  const lineCount = cart?.lines?.nodes?.length || 0;
  const checkoutUrl = cart?.checkoutUrl || null;

  let hostname: string | null = null;
  let pathname: string | null = null;

  if (checkoutUrl) {
    try {
      const parsed = new URL(checkoutUrl);
      hostname = parsed.hostname;
      pathname = parsed.pathname;
    } catch {
      // ignore parsing errors
    }
  }

  const errorExtensions = response.errors?.map((e) => e.extensions) || [];

  console.log(
    `[Shopify Cart Diagnosis] COMPLETE GraphQL Response:`,
    JSON.stringify(response.raw || response, null, 2)
  );
  console.log(`[Shopify Cart Diagnosis] HTTP status: ${response.status}`);
  console.log(
    `[Shopify Cart Diagnosis] GraphQL errors: ${
      response.errors ? JSON.stringify(response.errors, null, 2) : "null"
    }`
  );
  console.log(
    `[Shopify Cart Diagnosis] error extensions/code: ${JSON.stringify(errorExtensions, null, 2)}`
  );
  console.log(`[Shopify Cart Diagnosis] cart exists: ${cartExists}`);
  console.log(`[Shopify Cart Diagnosis] cart ID: ${cart?.id || cartId || "null"}`);
  console.log(`[Shopify Cart Diagnosis] line count: ${lineCount}`);
  console.log(`[Shopify Cart Diagnosis] checkoutUrl exists: ${Boolean(checkoutUrl)}`);
  console.log(`[Shopify Cart Diagnosis] checkoutUrl hostname: ${hostname}`);
  console.log(`[Shopify Cart Diagnosis] checkoutUrl pathname: ${pathname}`);

  return {
    status: response.status,
    errors: response.errors,
    cartExists,
    cartId: cart?.id || null,
    lineCount,
    checkoutUrl,
    hostname,
    pathname,
    rawResponse: response.raw,
  };
}

export async function fetchShopifyCheckoutUrl(cartId: string): Promise<string | null> {
  const diagnosis = await diagnoseShopifyCartCheckoutUrl(cartId);
  return diagnosis.checkoutUrl;
}
export const GET_CART_QUERY = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      lines(first: 100) {
        nodes {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              price {
                amount
                currencyCode
              }
              product {
                id
                title
                handle
                featuredImage {
                  url
                }
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
      cost {
        totalAmount {
          amount
          currencyCode
        }
        subtotalAmount {
          amount
          currencyCode
        }
      }
    }
  }
`;

export async function fetchShopifyProducts(): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>({
    query: PRODUCTS_QUERY,
  });
  return data?.products?.nodes || [];
}

export async function fetchShopifyCollections(): Promise<ShopifyCollection[]> {
  const data = await shopifyFetch<{ collections: { nodes: ShopifyCollection[] } }>({
    query: COLLECTIONS_QUERY,
  });
  return data?.collections?.nodes || [];
}

export async function fetchShopifyProductByHandle(
  handle: string
): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{ product: ShopifyProduct | null }>({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
  });
  return data?.product || null;
}

export interface ShopifyCartMutationResult {
  cart: ShopifyCart | null;
  userErrors: Array<{ field?: string[]; message: string }>;
  errors?: Array<{ message: string; extensions?: Record<string, unknown> }> | undefined;
  status: number;
}

export async function createShopifyCart(
  lines: Array<{ merchandiseId: string; quantity: number }> = []
): Promise<ShopifyCartMutationResult> {
  const response = await shopifyFetchRaw<{
    cartCreate: {
      cart: ShopifyCart | null;
      userErrors: Array<{ field?: string[]; message: string }>;
    };
  }>({
    query: CART_CREATE_MUTATION,
    variables: { input: { lines } },
  });

  const data = response.data?.cartCreate;
  const userErrors = data?.userErrors || [];
  const cart = data?.cart || null;

  console.log("[Shopify cartCreate] cart ID:", cart?.id || null);
  console.log("[Shopify cartCreate] userErrors:", userErrors);
  console.log("[Shopify cartCreate] GraphQL errors:", response.errors || null);

  return {
    cart,
    userErrors,
    errors: response.errors,
    status: response.status,
  };
}

export async function fetchShopifyCart(cartId: string): Promise<ShopifyCart | null> {
  const response = await shopifyFetchRaw<{ cart: ShopifyCart | null }>({
    query: GET_CART_QUERY,
    variables: { cartId },
  });
  const cart = response.data?.cart || null;
  if (cart) {
    const hostname = cart.checkoutUrl ? new URL(cart.checkoutUrl).hostname : null;
    console.log(`[Shopify Cart] Cart ID: ${cart.id}, Checkout Hostname: ${hostname}`);
  }
  return cart;
}

export async function addLinesToShopifyCart(
  cartId: string,
  lines: Array<{ merchandiseId: string; quantity: number }>
): Promise<ShopifyCartMutationResult> {
  const response = await shopifyFetchRaw<{
    cartLinesAdd: {
      cart: ShopifyCart | null;
      userErrors: Array<{ field?: string[]; message: string }>;
    };
  }>({
    query: CART_LINES_ADD_MUTATION,
    variables: { cartId, lines },
  });

  const data = response.data?.cartLinesAdd;
  const userErrors = data?.userErrors || [];
  const cart = data?.cart || null;

  console.log("cart ID:", cartId);
  console.log("merchandise/variant ID:", lines[0]?.merchandiseId);
  console.log("quantity:", lines[0]?.quantity);
  console.log("returned Shopify line count:", cart?.lines?.nodes?.length || 0);
  console.log("cartLinesAdd userErrors:", userErrors.length > 0 ? userErrors : null);
  console.log("GraphQL errors:", response.errors || null);

  return {
    cart,
    userErrors,
    errors: response.errors,
    status: response.status,
  };
}

export async function updateShopifyCartLine(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>
): Promise<ShopifyCart | null> {
  const response = await shopifyFetchRaw<{
    cartLinesUpdate: {
      cart: ShopifyCart | null;
      userErrors: Array<{ field?: string[]; message: string }>;
    };
  }>({
    query: CART_LINES_UPDATE_MUTATION,
    variables: { cartId, lines },
  });

  if (response.data?.cartLinesUpdate?.userErrors && response.data.cartLinesUpdate.userErrors.length > 0) {
    console.error("[Shopify] cartLinesUpdate userErrors:", response.data.cartLinesUpdate.userErrors);
  }
  return response.data?.cartLinesUpdate?.cart || null;
}

export async function removeLinesFromShopifyCart(
  cartId: string,
  lineIds: string[]
): Promise<ShopifyCart | null> {
  const response = await shopifyFetchRaw<{
    cartLinesRemove: {
      cart: ShopifyCart | null;
      userErrors: Array<{ field?: string[]; message: string }>;
    };
  }>({
    query: CART_LINES_REMOVE_MUTATION,
    variables: { cartId, lineIds },
  });

  if (response.data?.cartLinesRemove?.userErrors && response.data.cartLinesRemove.userErrors.length > 0) {
    console.error("[Shopify] cartLinesRemove userErrors:", response.data.cartLinesRemove.userErrors);
  }
  return response.data?.cartLinesRemove?.cart || null;
}
