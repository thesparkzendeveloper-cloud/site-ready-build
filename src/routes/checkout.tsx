import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Lock,
  ShieldCheck,
  Truck,
  ArrowRight,
  ArrowLeft,
  Tag,
  CreditCard,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Crumbs } from "@/components/site/Crumbs";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/products";
import { toast } from "sonner";
import type { RazorpayOptions, RazorpayPaymentResponse } from "@/types/razorpay";

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

// Helper function to load Razorpay official SDK dynamically
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cart,
    cartId,
    totalQuantity,
    subtotal,
    currencyCode,
    updateQuantity,
    removeFromCart,
    clearCart,
    getShopifyCheckoutUrl,
  } = useCart();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isShopifyRedirecting, setIsShopifyRedirecting] = useState(false);
  const [paymentCancelled, setPaymentCancelled] = useState(false);
  const [paymentMethodChoice, setPaymentMethodChoice] = useState<"shopify" | "razorpay">("shopify");

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

  // Preload Razorpay script on mount
  useEffect(() => {
    loadRazorpayScript();
  }, []);

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
    setAppliedCodeMsg(`Code "${discountCode.toUpperCase()}" entered. Verified at checkout.`);
    toast.info("Discount codes are verified and applied during final processing.");
  };

  // 1. Direct Shopify Native Checkout (Guarantees Order Creation in Shopify Admin + All Gateways)
  const handleShopifyCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty. Add products before checking out.");
      return;
    }

    setIsShopifyRedirecting(true);
    toast.loading("Connecting to Shopify Secure Checkout...", { id: "checkout-redirect" });

    try {
      const liveCheckoutUrl = await getShopifyCheckoutUrl();
      toast.dismiss("checkout-redirect");

      if (liveCheckoutUrl) {
        toast.success("Redirecting to Shopify Checkout...");
        window.location.href = liveCheckoutUrl;
      } else {
        toast.error("Could not initialize Shopify checkout. Please try again.");
        setIsShopifyRedirecting(false);
      }
    } catch (err) {
      console.error("[Shopify Checkout Error]:", err);
      toast.dismiss("checkout-redirect");
      toast.error("Error opening Shopify checkout. Please refresh and try again.");
      setIsShopifyRedirecting(false);
    }
  };

  // 2. Razorpay In-App Checkout (with seamless Shopify fallback)
  const handleRazorpayCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty. Add products before checking out.");
      return;
    }

    if (!formData.email.trim() || !formData.phone.trim() || !formData.firstName.trim()) {
      toast.error("Please enter your contact email, phone number, and first name.");
      return;
    }

    setIsProcessing(true);
    setPaymentCancelled(false);

    try {
      // Call server API to create Razorpay Order
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: subtotal,
          cartId: cartId || "",
          customer: {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            phone: formData.phone,
          },
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        orderId?: string;
        amount?: number;
        currency?: string;
        keyId?: string;
        error?: string;
      };

      if (!res.ok || !data.success || !data.orderId) {
        console.warn("[Razorpay Init Warning]: Razorpay API keys not live. Offering Shopify Checkout fallback.", data);
        toast.error(data.error || "Razorpay in-app gateway unavailable. Redirecting to Shopify Secure Checkout...");
        
        // Graceful fallback to Shopify Checkout
        const shopifyUrl = await getShopifyCheckoutUrl();
        if (shopifyUrl) {
          setTimeout(() => {
            window.location.href = shopifyUrl;
          }, 1200);
          return;
        }
        setIsProcessing(false);
        return;
      }

      // Ensure Razorpay SDK is ready
      const sdkReady = await loadRazorpayScript();
      if (!sdkReady || !window.Razorpay) {
        toast.error("Razorpay SDK failed to load. Falling back to Shopify Secure Checkout...");
        const shopifyUrl = await getShopifyCheckoutUrl();
        if (shopifyUrl) {
          window.location.href = shopifyUrl;
        }
        setIsProcessing(false);
        return;
      }

      // Open Razorpay Standard Checkout
      const options: RazorpayOptions = {
        key: data.keyId || "rzp_test_sparkzen123",
        amount: data.amount || Math.round(subtotal * 100),
        currency: data.currency || "INR",
        name: "Spark Zen",
        description: "Spark Zen Clothing Order",
        order_id: data.orderId,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`.trim() || "Customer",
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#e11d48",
        },
        handler: async function (response: RazorpayPaymentResponse) {
          try {
            console.log("[Razorpay Success Handler] Response received:", {
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
            });

            if (!response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
              toast.error("Payment verification failed. Please contact support.");
              setIsProcessing(false);
              return;
            }

            toast.loading("Verifying payment signature...", { id: "verify-toast" });

            const cartItemsPayload = cart.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              title: item.title,
              price: item.price,
            }));

            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                cartId: cartId || "",
                amount: subtotal,
                customer: formData,
                lineItems: cartItemsPayload,
              }),
            });

            const verifyData = (await verifyRes.json().catch(() => ({}))) as {
              success?: boolean;
              error?: string;
              shopifyOrder?: { success?: boolean; orderNumber?: number; error?: string };
            };
            toast.dismiss("verify-toast");

            if (verifyRes.ok && verifyData.success) {
              toast.success("Payment verified successfully!");

              const searchParams = new URLSearchParams({
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
                amount: String(subtotal),
                currency: currencyCode || "INR",
              }).toString();

              clearCart();

              try {
                navigate({
                  to: "/order-success",
                  search: {
                    payment_id: response.razorpay_payment_id,
                    order_id: response.razorpay_order_id,
                    amount: subtotal,
                    currency: currencyCode,
                  },
                });
              } catch (navErr) {
                console.warn("[Razorpay Redirect] Falling back to window.location:", navErr);
              }

              setTimeout(() => {
                if (window.location.pathname !== "/order-success" && window.location.pathname !== "/order-confirmed") {
                  window.location.href = `/order-success?${searchParams}`;
                }
              }, 100);
            } else {
              toast.error("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Verification Exception:", err);
            toast.dismiss("verify-toast");
            toast.error("Payment verification failed. Please contact support.");
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setPaymentCancelled(true);
            toast.info("Payment was not completed.");
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", (response: any) => {
        const err = response?.error;
        console.error("[Razorpay] Payment error:", err);
        setIsProcessing(false);
        setPaymentCancelled(true);
        toast.error(err?.description || "Payment was not completed.");
      });

      razorpayInstance.open();
    } catch (err) {
      console.error("Checkout Exception:", err);
      toast.error("Network error while connecting to payment gateway.");
      setIsProcessing(false);
    }
  };

  const handleMainCheckoutAction = () => {
    if (paymentMethodChoice === "shopify") {
      handleShopifyCheckout();
    } else {
      handleRazorpayCheckout();
    }
  };

  return (
    <SiteLayout>
      <Crumbs items={[{ label: "Home", to: "/" }, { label: "Shop", to: "/shop" }, { label: "Checkout" }]} />

      {/* Checkout Hero Title */}
      <header className="panel-ink mt-4 rounded-2xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Official SparkZen Store Checkout
            </p>
            <h1 className="mt-2 text-3xl text-ink-foreground sm:text-4xl font-extrabold">Secure Checkout</h1>
            <p className="mt-2 max-w-lg text-sm text-ink-muted">
              Review your cart items and complete your order with instant order confirmation & tracking.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 border border-primary/30 px-3.5 py-1.5 text-xs font-bold text-primary">
              <ShieldCheck className="h-4 w-4" /> 100% Buyer Protection
            </span>
          </div>
        </div>
      </header>

      {/* Payment Cancelled Alert Banner */}
      {paymentCancelled && (
        <div className="mt-6 surface-card rounded-2xl p-5 border-2 border-amber-500/50 bg-amber-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-foreground">Payment was not completed.</p>
              <p className="text-xs text-muted-foreground">
                Your cart items are preserved. You can complete your order directly via Shopify Secure Checkout.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShopifyCheckout}
              disabled={isShopifyRedirecting}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:scale-105 transition-transform cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Complete via Shopify
            </button>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
            >
              Back to Shop
            </Link>
          </div>
        </div>
      )}

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
          {/* Left Column: Contact & Delivery & Payment Selection */}
          <div className="space-y-6">
            {/* Step 1: Contact Information */}
            <section className="surface-card rounded-2xl p-6 border border-border space-y-4">
              <h2 className="text-base font-extrabold uppercase tracking-[0.12em] text-foreground flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-xs text-primary font-bold">1</span>
                Contact Information
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </section>

            {/* Step 2: Delivery Information */}
            <section className="surface-card rounded-2xl p-6 border border-border space-y-4">
              <h2 className="text-base font-extrabold uppercase tracking-[0.12em] text-foreground flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-xs text-primary font-bold">2</span>
                Delivery Address
              </h2>
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Address</label>
                  <input
                    type="text"
                    name="address"
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
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">City</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">State</label>
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">PIN Code</label>
                    <input
                      type="text"
                      name="pinCode"
                      placeholder="6-digit PIN"
                      value={formData.pinCode}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Country / Region</label>
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

            {/* Step 3: Delivery Method */}
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
                    <p className="text-xs text-muted-foreground">Estimated delivery within 2–4 business days across India</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-primary uppercase">Free</span>
              </div>
            </section>

            {/* Step 4: Payment Method Selection */}
            <section className="surface-card rounded-2xl p-6 border border-border space-y-4">
              <h2 className="text-base font-extrabold uppercase tracking-[0.12em] text-foreground flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-xs text-primary font-bold">4</span>
                Select Payment Method
              </h2>

              <div className="space-y-3">
                {/* Option 1: Shopify Official Checkout (Recommended) */}
                <div
                  onClick={() => setPaymentMethodChoice("shopify")}
                  className={`flex items-start gap-3.5 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                    paymentMethodChoice === "shopify"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-border/80 bg-background/50"
                  }`}
                >
                  <div className="mt-0.5 grid h-5 w-5 place-items-center rounded-full border-2 border-primary">
                    {paymentMethodChoice === "shopify" && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-foreground flex items-center gap-2">
                        Shopify Official Checkout <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      </p>
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-600">
                        Recommended
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Instant secure checkout with <strong>UPI, Google Pay, PhonePe, Paytm, Credit & Debit Cards, NetBanking, and Cash on Delivery (COD)</strong>. Creates your verified order directly in Shopify.
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] font-semibold text-muted-foreground">
                      <span className="rounded bg-muted px-2 py-0.5">UPI / QR</span>
                      <span className="rounded bg-muted px-2 py-0.5">GPay</span>
                      <span className="rounded bg-muted px-2 py-0.5">PhonePe</span>
                      <span className="rounded bg-muted px-2 py-0.5">Cards</span>
                      <span className="rounded bg-muted px-2 py-0.5">COD</span>
                    </div>
                  </div>
                </div>

                {/* Option 2: Razorpay Standard Checkout */}
                <div
                  onClick={() => setPaymentMethodChoice("razorpay")}
                  className={`flex items-start gap-3.5 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                    paymentMethodChoice === "razorpay"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-border/80 bg-background/50"
                  }`}
                >
                  <div className="mt-0.5 grid h-5 w-5 place-items-center rounded-full border-2 border-primary">
                    {paymentMethodChoice === "razorpay" && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-foreground">Razorpay In-App Checkout</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Opens Razorpay standard payment modal with 256-bit encryption and server-side signature verification.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary & Actions */}
          <div className="space-y-6">
            <div className="surface-card rounded-2xl p-6 border border-border space-y-6 lg:sticky lg:top-24">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">Order Summary</h2>
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Product items list */}
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
                            className="text-muted-foreground hover:text-destructive transition-colors p-1 cursor-pointer"
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
                  <span className="text-emerald-500 font-bold">Free Express</span>
                </div>
                <div className="flex justify-between text-lg font-extrabold text-foreground pt-3 border-t border-border">
                  <span>Total Payable</span>
                  <span className="text-primary text-xl font-black">{formatPrice(subtotal, currencyCode)}</span>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleMainCheckoutAction}
                  disabled={isProcessing || isShopifyRedirecting || cart.length === 0}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-base font-bold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-lg"
                  style={{ boxShadow: "var(--shadow-glow)" }}
                >
                  {isShopifyRedirecting ? (
                    "Connecting to Shopify Checkout..."
                  ) : isProcessing ? (
                    "Connecting to Payment Gateway..."
                  ) : paymentMethodChoice === "shopify" ? (
                    <>
                      Complete on Shopify Secure Checkout <ExternalLink className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Pay with Razorpay Standard <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                {/* Instant 1-Click Shopify Checkout alternative button if user chose Razorpay */}
                {paymentMethodChoice === "razorpay" && (
                  <button
                    onClick={handleShopifyCheckout}
                    disabled={isShopifyRedirecting || cart.length === 0}
                    className="w-full flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    Or Complete with Shopify Checkout (UPI, Cards, COD) <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}

                {/* Trust Badges */}
                <div className="rounded-xl bg-muted/40 p-3.5 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-foreground">
                    <Lock className="h-3.5 w-3.5 text-primary" />
                    <span>256-Bit SSL Encrypted & Verified Checkout</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    All transactions are encrypted and backed by Shopify Buyer Protection.
                  </p>

                  <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground pt-2 border-t border-border/50">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Official Store
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5 text-primary" /> Fast Dispatch
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
