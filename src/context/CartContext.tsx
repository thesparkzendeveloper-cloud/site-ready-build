import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  createShopifyCart,
  fetchShopifyCart,
  diagnoseShopifyCartCheckoutUrl,
  fetchShopifyProducts,
  fetchShopifyProductByHandle,
  addLinesToShopifyCart,
  updateShopifyCartLine,
  removeLinesFromShopifyCart,
  type ShopifyCart,
} from "@/lib/shopify";

export interface CartItem {
  id: string; // Cart line ID (or variantId in local mode)
  variantId: string;
  productId?: string;
  title: string;
  handle: string;
  price: number;
  currencyCode?: string;
  quantity: number;
  image: string;
  selectedOptions?: Array<{ name: string; value: string }>;
}

interface CartContextType {
  cart: CartItem[];
  cartId: string | null;
  totalQuantity: number;
  subtotal: number;
  currencyCode: string;
  checkoutUrl: string | null;
  isLoading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: {
    variantId: string;
    quantity?: number;
    title?: string;
    handle?: string;
    price?: number;
    image?: string;
    selectedOptions?: Array<{ name: string; value: string }>;
  }) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
  checkout: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_CART_KEY = "shopify_cart_id";
const LOCAL_ITEMS_KEY = "sparkzen_local_cart_items";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartId, setCartId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(LOCAL_CART_KEY);
    }
    return null;
  });

  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_ITEMS_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse local cart items", e);
        }
      }
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [currencyCode, setCurrencyCode] = useState<string>("INR");

  const syncShopifyCart = useCallback((shopifyCart: ShopifyCart) => {
    setCartId(shopifyCart.id);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_CART_KEY, shopifyCart.id);
    }

    if (shopifyCart.checkoutUrl) {
      setCheckoutUrl(shopifyCart.checkoutUrl);
    }

    setCurrencyCode(shopifyCart.cost.subtotalAmount.currencyCode || "INR");

    const mappedItems: CartItem[] = shopifyCart.lines.nodes.map((node) => ({
      id: node.id,
      variantId: node.merchandise.id,
      productId: node.merchandise.product.id,
      title: node.merchandise.product.title,
      handle: node.merchandise.product.handle,
      price: Math.round(parseFloat(node.merchandise.price.amount)),
      currencyCode: node.merchandise.price.currencyCode,
      quantity: node.quantity,
      image: node.merchandise.product.featuredImage?.url || "",
      selectedOptions: node.merchandise.selectedOptions,
    }));

    setCart(mappedItems);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_ITEMS_KEY, JSON.stringify(mappedItems));
    }
  }, []);

  // Helper to resolve real Shopify ProductVariant ID if a mock/fallback ID was provided
  const resolveRealVariantId = async (
    variantId: string,
    handle?: string
  ): Promise<string | null> => {
    if (variantId && variantId.startsWith("gid://shopify/ProductVariant/")) {
      return variantId;
    }
    if (handle) {
      const sp = await fetchShopifyProductByHandle(handle);
      if (sp && sp.variants?.nodes && sp.variants.nodes.length > 0) {
        return sp.variants.nodes[0]!.id;
      }
    }
    const products = await fetchShopifyProducts();
    for (const p of products) {
      if (p.handle === handle || p.id === variantId) {
        if (p.variants?.nodes && p.variants.nodes.length > 0) {
          return p.variants.nodes[0]!.id;
        }
      }
    }
    return null;
  };

  // Restore shopify_cart_id on mount & sync state
  useEffect(() => {
    let isMounted = true;
    async function loadCart() {
      const storedCartId = typeof window !== "undefined" ? localStorage.getItem(LOCAL_CART_KEY) : null;
      if (!storedCartId) return;

      setIsLoading(true);
      try {
        const fetchedCart = await fetchShopifyCart(storedCartId);
        if (fetchedCart && isMounted) {
          syncShopifyCart(fetchedCart);
        } else if (isMounted) {
          if (typeof window !== "undefined") {
            localStorage.removeItem(LOCAL_CART_KEY);
          }
          setCartId(null);
          setCheckoutUrl(null);
        }
      } catch (err) {
        console.error("Failed to verify/restore Shopify cart:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadCart();
    return () => {
      isMounted = false;
    };
  }, [syncShopifyCart]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Add To Cart Flow
  const addToCart = async ({
    variantId,
    quantity = 1,
    title = "Product",
    handle = "",
    price = 0,
    image = "",
    selectedOptions = [],
  }: {
    variantId: string;
    quantity?: number;
    title?: string;
    handle?: string;
    price?: number;
    image?: string;
    selectedOptions?: Array<{ name: string; value: string }>;
  }) => {
    setIsLoading(true);
    try {
      // 1. Get REAL Shopify ProductVariant ID
      const realVariantId = await resolveRealVariantId(variantId, handle);

      if (!realVariantId || !realVariantId.startsWith("gid://shopify/ProductVariant/")) {
        const errorMsg = `Selected variant "${title}" does not map to a real Shopify ProductVariant ID. Ensure products exist on Shopify.`;
        console.error("[Shopify Add-to-Cart Error]", errorMsg);
        toast.error(`Shopify API Error: ${errorMsg}`);
        setIsLoading(false);
        return;
      }

      let activeCartId = cartId || (typeof window !== "undefined" ? localStorage.getItem(LOCAL_CART_KEY) : null);

      // 2. If no valid Shopify cart ID exists, call cartCreate & save to localStorage (shopify_cart_id)
      if (!activeCartId) {
        const createRes = await createShopifyCart([]);
        if (createRes.cart) {
          activeCartId = createRes.cart.id;
          syncShopifyCart(createRes.cart);
        } else {
          const errMsg =
            createRes.userErrors[0]?.message ||
            createRes.errors?.[0]?.message ||
            "Failed to create Shopify cart.";
          toast.error(`Shopify API Error: ${errMsg}`);
          setIsLoading(false);
          return;
        }
      }

      // 3. Immediately call cartLinesAdd with REAL ProductVariant ID and quantity
      let addRes = await addLinesToShopifyCart(activeCartId, [
        { merchandiseId: realVariantId, quantity },
      ]);

      // 9. If existing cart ID is stale/null, recreate cart & retry cartLinesAdd once
      if (
        !addRes.cart &&
        (addRes.userErrors.some((e) => e.message?.toLowerCase().includes("does not exist")) ||
          addRes.errors?.length)
      ) {
        console.warn("Shopify cart ID is stale/invalid. Recreating cart & retrying cartLinesAdd...");
        const recreateRes = await createShopifyCart([]);
        if (recreateRes.cart) {
          activeCartId = recreateRes.cart.id;
          syncShopifyCart(recreateRes.cart);
          addRes = await addLinesToShopifyCart(activeCartId, [
            { merchandiseId: realVariantId, quantity },
          ]);
        }
      }

      // 6. If cartLinesAdd returns userErrors, DO NOT silently update only local UI cart. Show actual error!
      if (addRes.userErrors && addRes.userErrors.length > 0) {
        const firstUserErr = addRes.userErrors[0]!;
        console.error("cartLinesAdd userErrors:", addRes.userErrors);
        toast.error(`Shopify API Error: ${firstUserErr.message}`);
        setIsLoading(false);
        return;
      }

      if (addRes.errors && addRes.errors.length > 0) {
        const firstErr = addRes.errors[0]!;
        console.error("cartLinesAdd GraphQL errors:", addRes.errors);
        toast.error(`Shopify API Error: ${firstErr.message || "GraphQL error"}`);
        setIsLoading(false);
        return;
      }

      // 5. After cartLinesAdd succeeds, fetch cart again and sync local cart state from Shopify
      const freshCart = await fetchShopifyCart(activeCartId);
      if (freshCart) {
        syncShopifyCart(freshCart);
        toast.success(`Added ${title} to cart`);
        setIsCartOpen(true);
      } else if (addRes.cart) {
        syncShopifyCart(addRes.cart);
        toast.success(`Added ${title} to cart`);
        setIsCartOpen(true);
      } else {
        toast.error("Failed to sync cart with Shopify.");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(`Error adding to cart: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(lineId);
      return;
    }

    setIsLoading(true);
    try {
      const currentCartId = cartId || (typeof window !== "undefined" ? localStorage.getItem(LOCAL_CART_KEY) : null);
      if (currentCartId && lineId.startsWith("gid://shopify/")) {
        const updatedCart = await updateShopifyCartLine(currentCartId, [{ id: lineId, quantity }]);
        if (updatedCart) {
          syncShopifyCart(updatedCart);
          return;
        }
      }

      setCart((prev) => {
        const newItems = prev.map((item) =>
          item.id === lineId ? { ...item, quantity } : item
        );
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_ITEMS_KEY, JSON.stringify(newItems));
        }
        return newItems;
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update cart");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (lineId: string) => {
    setIsLoading(true);
    try {
      const currentCartId = cartId || (typeof window !== "undefined" ? localStorage.getItem(LOCAL_CART_KEY) : null);
      if (currentCartId && lineId.startsWith("gid://shopify/")) {
        const updatedCart = await removeLinesFromShopifyCart(currentCartId, [lineId]);
        if (updatedCart) {
          syncShopifyCart(updatedCart);
          toast.info("Item removed from cart");
          return;
        }
      }

      setCart((prev) => {
        const newItems = prev.filter((item) => item.id !== lineId);
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_ITEMS_KEY, JSON.stringify(newItems));
        }
        return newItems;
      });
      toast.info("Item removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    } finally {
      setIsLoading(false);
    }
  };

  const isValidCustomerCheckoutUrl = (url: string | null): boolean => {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      if (
        parsed.hostname.includes("admin.shopify.com") ||
        parsed.pathname.includes("/admin") ||
        parsed.pathname.endsWith("/cart")
      ) {
        return false;
      }
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const checkout = async () => {
    let activeCartId = cartId || (typeof window !== "undefined" ? localStorage.getItem(LOCAL_CART_KEY) : null);

    if (!activeCartId) {
      toast.error("No active Shopify cart ID. Please add items to your cart.");
      return;
    }

    setIsLoading(true);
    try {
      const freshCart = await fetchShopifyCart(activeCartId);
      const diagnosis = await diagnoseShopifyCartCheckoutUrl(activeCartId);

      const cartExists = Boolean(freshCart || diagnosis.cartExists);
      const lineCount = freshCart?.lines?.nodes?.length || diagnosis.lineCount || 0;
      const firstLine = freshCart?.lines?.nodes?.[0];
      const variantId = firstLine?.merchandise?.id || null;
      const quantity = firstLine?.quantity || 0;
      const checkoutUrl = freshCart?.checkoutUrl || diagnosis.checkoutUrl || null;

      // Required console logging before checkout
      console.log("cart ID:", activeCartId || null);
      console.log("cart exists/null:", cartExists ? "exists" : "null");
      console.log("line count:", lineCount);
      console.log("product/variant ID:", variantId);
      console.log("quantity:", quantity);
      console.log("checkoutUrl exists/null:", Boolean(checkoutUrl) ? "exists" : "null");
      console.log("GraphQL errors:", diagnosis.errors || null);
      console.log("cartLinesAdd userErrors:", diagnosis.userErrors || null);

      if (diagnosis.errors && diagnosis.errors.length > 0) {
        const firstErr = diagnosis.errors[0];
        const code = (firstErr?.extensions?.["code"] as string) || "";
        const msg = firstErr?.message || "";
        const displayErr = msg || (code ? `Code: ${code}` : "Shopify Storefront API Error");

        toast.error(`Shopify API Error: ${displayErr}`);
        return;
      }

      if (!cartExists || lineCount === 0) {
        toast.error("Shopify cart is empty or not found. Please add items to your cart.");
        return;
      }

     if (checkoutUrl && isValidCustomerCheckoutUrl(checkoutUrl)) {
  console.log("🔥 ACTUAL SHOPIFY CHECKOUT URL:", checkoutUrl);
  window.open(checkoutUrl, "_blank", "noopener,noreferrer");
}else {
        toast.error(
          "Checkout URL currently unavailable. Verify your Storefront API credentials."
        );
      }
    } catch (err) {
      console.error("Exception during checkout redirect:", err);
      toast.error("An error occurred during checkout redirect.");
    } finally {
      setIsLoading(false);
    }
  };

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartId,
        totalQuantity,
        subtotal,
        currencyCode,
        checkoutUrl,
        isLoading,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

