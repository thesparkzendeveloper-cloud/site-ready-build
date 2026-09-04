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
  getShopifyCheckoutUrl: () => Promise<string | null>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_CART_KEY = "shopify_cart_id";
const LOCAL_ITEMS_KEY = "sparkzen_local_cart_items";

// Safe Storage Helpers to prevent uncaught DOMExceptions on real mobile Android Chrome inside third-party iframes
function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch (e) {
    console.warn("[CartContext] LocalStorage getItem error ignored:", e);
  }
  return null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch (e) {
    console.warn("[CartContext] LocalStorage setItem error ignored:", e);
  }
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.warn("[CartContext] LocalStorage removeItem error ignored:", e);
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartId, setCartId] = useState<string | null>(() => safeGetItem(LOCAL_CART_KEY));
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = safeGetItem(LOCAL_ITEMS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse local cart items", e);
      }
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [currencyCode, setCurrencyCode] = useState<string>("INR");

  const syncShopifyCart = useCallback((shopifyCart: ShopifyCart) => {
    setCartId(shopifyCart.id);
    safeSetItem(LOCAL_CART_KEY, shopifyCart.id);

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
    safeSetItem(LOCAL_ITEMS_KEY, JSON.stringify(mappedItems));
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
      const storedCartId = safeGetItem(LOCAL_CART_KEY);
      if (!storedCartId) return;

      setIsLoading(true);
      try {
        const fetchedCart = await fetchShopifyCart(storedCartId);
        if (fetchedCart && isMounted) {
          syncShopifyCart(fetchedCart);
        } else if (isMounted) {
          safeRemoveItem(LOCAL_CART_KEY);
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
    variantId: rawVariantId,
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
      // 1. Resolve real Shopify variant ID if raw Variant ID isn't a GID
      const realVariantId = (await resolveRealVariantId(rawVariantId, handle)) || rawVariantId;

      let activeCartId = cartId || safeGetItem(LOCAL_CART_KEY);

      // 2. If no cartId exists, create a new Shopify cart
      if (!activeCartId) {
        const newCart = await createShopifyCart([
          {
            merchandiseId: realVariantId,
            quantity,
          },
        ]);

        if (newCart && newCart.cart) {
          syncShopifyCart(newCart.cart);
          toast.success(`Added ${title} to cart`);
          setIsCartOpen(true);
          return;
        }

        // Fallback to local cart state if Shopify Storefront API cart creation returned null
        setCart((prev) => {
          const existingIndex = prev.findIndex((item) => item.variantId === realVariantId);
          let updated: CartItem[];
          if (existingIndex > -1) {
            updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex]!,
              quantity: updated[existingIndex]!.quantity + quantity,
            };
          } else {
            updated = [
              ...prev,
              {
                id: `local-line-${Date.now()}`,
                variantId: realVariantId,
                title,
                handle,
                price,
                quantity,
                image,
                selectedOptions,
              },
            ];
          }
          safeSetItem(LOCAL_ITEMS_KEY, JSON.stringify(updated));
          return updated;
        });

        toast.success(`Added ${title} to cart`);
        setIsCartOpen(true);
        return;
      }

      // 3. If activeCartId exists, add lines to existing Shopify cart
      const addRes = await addLinesToShopifyCart(activeCartId, [
        {
          merchandiseId: realVariantId,
          quantity,
        },
      ]);

      // 4. Handle expired cart ID
      if (
        (addRes.userErrors &&
          addRes.userErrors.some(
            (e) =>
              e.message.toLowerCase().includes("cart not found") ||
              e.message.toLowerCase().includes("does not exist") ||
              e.message.toLowerCase().includes("invalid cart")
          )) ||
        (addRes.errors &&
          addRes.errors.some(
            (e) =>
              e.message.toLowerCase().includes("cart not found") ||
              e.message.toLowerCase().includes("does not exist")
          ))
      ) {
        safeRemoveItem(LOCAL_CART_KEY);
        setCartId(null);

        const newCart = await createShopifyCart([
          {
            merchandiseId: realVariantId,
            quantity,
          },
        ]);

        if (newCart && newCart.cart) {
          syncShopifyCart(newCart.cart);
          toast.success(`Added ${title} to cart`);
          setIsCartOpen(true);
          return;
        }
      }

      // 5. If userErrors exist, display error toast
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

      // 6. After cartLinesAdd succeeds, fetch cart again and sync local cart state from Shopify
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
      const currentCartId = cartId || safeGetItem(LOCAL_CART_KEY);
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
        safeSetItem(LOCAL_ITEMS_KEY, JSON.stringify(newItems));
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
      const currentCartId = cartId || safeGetItem(LOCAL_CART_KEY);
      if (currentCartId && lineId.startsWith("gid://shopify/")) {
        const updatedCart = await removeLinesFromShopifyCart(currentCartId, [lineId]);
        if (updatedCart) {
          syncShopifyCart(updatedCart);
          return;
        }
      }

      setCart((prev) => {
        const newItems = prev.filter((item) => item.id !== lineId);
        safeSetItem(LOCAL_ITEMS_KEY, JSON.stringify(newItems));
        return newItems;
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item from cart");
    } finally {
      setIsLoading(false);
    }
  };

  const getShopifyCheckoutUrl = async (): Promise<string | null> => {
    try {
      const currentCartId = cartId || safeGetItem(LOCAL_CART_KEY);
      if (currentCartId) {
        const liveCheckout = await diagnoseShopifyCartCheckoutUrl(currentCartId);
        if (liveCheckout && liveCheckout.checkoutUrl) {
          setCheckoutUrl(liveCheckout.checkoutUrl);
          return liveCheckout.checkoutUrl;
        }
      }

      if (checkoutUrl) return checkoutUrl;

      // If cart has items but cartId is missing or expired, create fresh Shopify cart
      if (cart.length > 0) {
        const lines: Array<{ merchandiseId: string; quantity: number }> = [];
        for (const item of cart) {
          const vId = (await resolveRealVariantId(item.variantId, item.handle)) || item.variantId;
          lines.push({ merchandiseId: vId, quantity: item.quantity });
        }
        const created = await createShopifyCart(lines);
        if (created.cart) {
          syncShopifyCart(created.cart);
          return created.cart.checkoutUrl || null;
        }
      }
    } catch (error) {
      console.warn("[CartContext] Error resolving Shopify checkout URL:", error);
    }
    return null;
  };

  const checkout = async () => {
    setIsLoading(true);
    try {
      const targetCheckoutUrl = await getShopifyCheckoutUrl();
      if (targetCheckoutUrl) {
        window.location.href = targetCheckoutUrl;
        return;
      }
      window.location.href = "/checkout";
    } catch (error) {
      console.error("Checkout error:", error);
      window.location.href = "/checkout";
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = () => {
    setCart([]);
    setCartId(null);
    setCheckoutUrl(null);
    safeRemoveItem(LOCAL_CART_KEY);
    safeRemoveItem(LOCAL_ITEMS_KEY);
  };

  const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

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
        getShopifyCheckoutUrl,
        clearCart,
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
