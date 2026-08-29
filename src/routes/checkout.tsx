import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Lock,
  ShieldCheck,
  Truck,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Tag,
  CreditCard,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Crumbs } from "@/components/site/Crumbs";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/products";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — SparkZen Clothing" },
      {
        name: "description",
        content: "Review your cart items and complete your streetwear order securely with SparkZen.",
      },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const {
    cart,
    totalQuantity,
    subtotal,
    currencyCode,
    updateQuantity,
    removeFromCart,
    checkout,
    isLoading,
  } = useCart();

  // Delivery & Contact Form State
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pinCode: "",
    country: "India",
  });

  // Discount code state
  const [discountCode, setDiscountCode] = useState("");
  const [appliedCodeMsg, setAppliedCodeMsg] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountCode.trim()) return;
    setAppliedCodeMsg(`Code "${discountCode.toUpperCase()}" entered. Discount codes are applied at Shopify checkout.`);
    toast.info("Discount codes are verified and applied at Shopify checkout.");
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty. Add products before checking out.");
      return;
    }
    checkout();
  };

  return (
    <SiteLayout>
      <Crumbs items={[{ label: "Home", to: "/" }, { label: "Shop", to: "/shop" }, { label: "Checkout" }]} />

      {/* Checkout Hero Title */}
      <header className="panel-ink mt-4 rounded-2xl px-6 py-8">
        <p className="eyebrow">Order Review</p>
        <h1 className="mt-2 text-3xl text-ink-foreground sm:text-4xl">Checkout</h1>
        <p className="mt-2 max-w-lg text-sm text-ink-muted">
          Complete your order details securely before proceeding to final payment.
        </p>
      </header>

      {cart.length === 0 ? (
        /* Empty Cart State */
        <div className="mt-10 flex flex-col items-center justify-center surface-card rounded-2xl p-12 text-center border border-border">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-muted text-muted-foreground">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-foreground">Your cart is empty</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Add something from the SparkZen collection to continue to checkout.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            Continue Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        /* Main Checkout Layout */
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Mobile Order Summary (shown first on mobile for easy scan) */}
          <div className="lg:hidden surface-card rounded-2xl p-6 border border-border space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-lg font-bold text-foreground">Order Summary</h2>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
              </span>
            </div>

            {/* Product items */}
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex gap-3 items-center">
                    <img src={item.image} alt={item.title} className="h-14 w-12 rounded-lg object-cover bg-muted" />
                    <div>
                      <p className="text-xs font-bold line-clamp-1">{item.title}</p>
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <p className="text-[11px] text-muted-foreground">
                          {item.selectedOptions
                            .filter((o) => o.value !== "Title" && o.value !== "Default Title")
                            .map((o) => `${o.name}: ${o.value}`)
                            .join(" · ")}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-primary">
                    {formatPrice(item.price * item.quantity, item.currencyCode || currencyCode)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm pt-2 border-t border-border">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-extrabold text-foreground">{formatPrice(subtotal, currencyCode)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="text-primary font-semibold">Free</span>
              </div>
              <div className="flex justify-between text-base font-extrabold pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary text-lg">{formatPrice(subtotal, currencyCode)}</span>
              </div>
            </div>
          </div>

          {/* Left Column: Contact & Delivery Information */}
          <div className="space-y-6">
            {/* Contact Information */}
            <section className="surface-card rounded-2xl p-6 border border-border space-y-4">
              <h2 className="text-base font-extrabold uppercase tracking-[0.12em] text-foreground flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-xs text-primary font-bold">1</span>
                Contact Information
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </section>

            {/* Delivery Information */}
            <section className="surface-card rounded-2xl p-6 border border-border space-y-4">
              <h2 className="text-base font-extrabold uppercase tracking-[0.12em] text-foreground flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-xs text-primary font-bold">2</span>
                Delivery Address
              </h2>
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Address *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="House no, Street name, Area"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Apartment / Suite (optional)</label>
                  <input
                    type="text"
                    name="apartment"
                    placeholder="Flat, suite, unit, landmark (optional)"
                    value={formData.apartment}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">State *</label>
                    <input
                      type="text"
                      name="state"
                      required
                      placeholder="State"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">PIN Code *</label>
                    <input
                      type="text"
                      name="pinCode"
                      required
                      placeholder="6-digit PIN"
                      value={formData.pinCode}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Country / Region *</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Delivery Method */}
            <section className="surface-card rounded-2xl p-6 border border-border space-y-3">
              <h2 className="text-base font-extrabold uppercase tracking-[0.12em] text-foreground flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-xs text-primary font-bold">3</span>
                Delivery Method
              </h2>
              <div className="flex items-center justify-between rounded-xl border-2 border-primary bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Standard Express Shipping</p>
                    <p className="text-xs text-muted-foreground">Estimated delivery within 2–4 business days</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-primary uppercase">Free</span>
              </div>
            </section>

            {/* Payment Info Note */}
            <section className="surface-card rounded-2xl p-6 border border-border space-y-3">
              <h2 className="text-base font-extrabold uppercase tracking-[0.12em] text-foreground flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-xs text-primary font-bold">4</span>
                Payment
              </h2>
              <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
                <CreditCard className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-foreground">Secure Payment via Shopify & Razorpay</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Your payment details are encrypted and securely processed directly on Shopify's official hosted checkout page.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary & Actions (Desktop & Mobile sticky) */}
          <div className="space-y-6">
            <div className="surface-card rounded-2xl p-6 border border-border space-y-6 lg:sticky lg:top-24">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">Order Summary</h2>
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Product items list with full controls */}
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 rounded-xl p-3 border border-border/60 bg-background/50">
                    <img src={item.image} alt={item.title} className="h-20 w-16 rounded-lg object-cover bg-muted shrink-0" />
                    
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-foreground line-clamp-1">{item.title}</h3>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            aria-label="Remove item"
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {item.selectedOptions
                              .filter((o) => o.value !== "Title" && o.value !== "Default Title")
                              .map((o) => `${o.name}: ${o.value}`)
                              .join(" · ")}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-extrabold text-primary">
                          {formatPrice(item.price, item.currencyCode || currencyCode)}
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background p-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-foreground">{item.quantity}</span>
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

              {/* Discount Code Input */}
              <form onSubmit={handleApplyDiscount} className="space-y-2 pt-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Discount code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl border border-primary bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {appliedCodeMsg && <p className="text-xs text-primary font-medium">{appliedCodeMsg}</p>}
              </form>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-sm pt-4 border-t border-border">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-extrabold text-foreground">{formatPrice(subtotal, currencyCode)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-primary font-semibold">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-lg font-extrabold text-foreground pt-3 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary text-xl">{formatPrice(subtotal, currencyCode)}</span>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleProceedToCheckout}
                  disabled={isLoading || cart.length === 0}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-base font-bold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
                  style={{ boxShadow: "var(--shadow-glow)" }}
                >
                  {isLoading ? "Processing..." : "Proceed to Secure Checkout →"}
                </button>

                {/* Trust Badges */}
                <div className="rounded-xl bg-muted/40 p-3.5 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-foreground">
                    <Lock className="h-3.5 w-3.5 text-primary" />
                    <span>Secure Checkout</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Your payment is securely processed by Shopify.</p>

                  <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground pt-2 border-t border-border/50">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" /> 256-Bit SSL
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5 text-primary" /> Express Dispatch
                    </span>
                    <span className="flex items-center gap-1">
                      <RefreshCw className="h-3.5 w-3.5 text-primary" /> Easy Returns
                    </span>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" /> Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
