import React from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/products";

export function CartDrawer() {
  const {
    cart,
    totalQuantity,
    subtotal,
    currencyCode,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    checkout,
    isLoading,
  } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent
        side="right"
        className="flex h-full h-[100dvh] max-h-[100dvh] w-full flex-col p-0 gap-0 overflow-hidden sm:max-w-md bg-background"
      >
        {/* Header */}
        <SheetHeader className="border-b border-border p-5 text-left shrink-0 bg-background">
          <SheetTitle className="flex items-center gap-2.5 text-lg font-bold text-foreground">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Your Cart ({totalQuantity})
          </SheetTitle>
        </SheetHeader>

        {/* Content */}
        {cart.length === 0 ? (
          <div className="flex flex-1 min-h-0 flex-col items-center justify-center p-6 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-muted text-muted-foreground">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">Your cart is empty</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              Looks like you haven't added any streetwear pieces to your cart yet.
            </p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] cursor-pointer"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-1 min-h-0 flex-col justify-between overflow-hidden">
            {/* Items list */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3.5 overscroll-contain">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="surface-card flex gap-3.5 rounded-xl p-3 sm:p-3.5 border border-border/60 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 min-w-0 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        {item.handle ? (
                          <Link
                            to="/product/$slug"
                            params={{ slug: item.handle }}
                            onClick={() => setIsCartOpen(false)}
                            className="text-sm font-bold text-foreground hover:text-primary line-clamp-1"
                          >
                            {item.title}
                          </Link>
                        ) : (
                          <Link
                            to="/shop"
                            onClick={() => setIsCartOpen(false)}
                            className="text-sm font-bold text-foreground hover:text-primary line-clamp-1"
                          >
                            {item.title}
                          </Link>
                        )}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Remove item"
                          className="text-muted-foreground hover:text-destructive transition-colors p-1 cursor-pointer shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                          {item.selectedOptions
                            .filter((opt) => opt.value !== "Title" && opt.value !== "Default Title")
                            .map((opt) => `${opt.name}: ${opt.value}`)
                            .join(" · ")}
                        </p>
                      )}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <span className="text-sm font-extrabold text-primary shrink-0">
                        {formatPrice(item.price, item.currencyCode || currencyCode)}
                      </span>

                      {/* Quantity buttons */}
                      <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-0.5 sm:p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-border bg-background p-4 sm:p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-3.5 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-extrabold text-foreground">
                    {formatPrice(subtotal, currencyCode)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Shipping & Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <Link
                to="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                style={{ boxShadow: "var(--shadow-glow)" }}
              >
                Checkout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
