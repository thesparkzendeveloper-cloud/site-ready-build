import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ShoppingBag, ArrowRight, ShieldCheck, Truck, PackageCheck } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Crumbs } from "@/components/site/Crumbs";
import { formatPrice } from "@/lib/products";

type OrderConfirmedSearch = {
  payment_id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
};

export const Route = createFileRoute("/order-confirmed")({
  validateSearch: (search: Record<string, unknown>): OrderConfirmedSearch => {
    return {
      payment_id: typeof search["payment_id"] === "string" ? search["payment_id"] : "",
      order_id: typeof search["order_id"] === "string" ? search["order_id"] : "",
      amount: typeof search["amount"] === "number" ? search["amount"] : Number(search["amount"]) || 0,
      currency: typeof search["currency"] === "string" ? search["currency"] : "INR",
    };
  },
  head: () => ({
    meta: [
      { title: "Order Confirmed — SparkZen Clothing" },
      {
        name: "description",
        content: "Thank you for your order! Your payment has been successfully verified.",
      },
    ],
  }),
  component: OrderConfirmedPage,
});

function OrderConfirmedPage() {
  const { payment_id, order_id, amount, currency } = Route.useSearch();

  const safeAmount = typeof amount === "number" ? amount : 0;
  const formattedAmount = safeAmount > 0 ? formatPrice(safeAmount, currency || "INR") : "Paid";

  return (
    <SiteLayout>
      <Crumbs items={[{ label: "Home", to: "/" }, { label: "Shop", to: "/shop" }, { label: "Order Confirmed" }]} />

      <div className="mt-8 max-w-2xl mx-auto space-y-6">
        {/* Success Header */}
        <section className="panel-ink rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary/20 text-primary border-2 border-primary/40">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>

          <p className="eyebrow mt-5">Payment Confirmed</p>
          <h1 className="mt-2 text-3xl sm:text-4xl text-ink-foreground font-extrabold">
            Payment Successful!
          </h1>
          <p className="mt-3 text-sm sm:text-base text-ink-muted max-w-md mx-auto leading-relaxed">
            Thank you for your order. Your payment has been securely verified and your streetwear pieces are being prepared for dispatch.
          </p>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/30 px-5 py-2 text-xs font-bold text-primary">
            <PackageCheck className="h-4 w-4" /> Order Confirmation Email Sent
          </div>
        </section>

        {/* Order Details Card */}
        <section className="surface-card rounded-2xl p-6 border border-border space-y-5">
          <h2 className="text-base font-extrabold uppercase tracking-[0.12em] text-foreground flex items-center gap-2 border-b border-border pb-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Transaction Receipt
          </h2>

          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-background/60 p-4 space-y-1">
              <span className="text-xs text-muted-foreground font-semibold">Payment ID</span>
              <p className="font-mono text-xs font-bold text-foreground break-all">
                {payment_id || "pay_verified_sparkzen"}
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-background/60 p-4 space-y-1">
              <span className="text-xs text-muted-foreground font-semibold">Order Reference</span>
              <p className="font-mono text-xs font-bold text-foreground break-all">
                {order_id || "ord_verified_sparkzen"}
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-background/60 p-4 space-y-1">
              <span className="text-xs text-muted-foreground font-semibold">Amount Paid</span>
              <p className="text-base font-extrabold text-primary">{formattedAmount}</p>
            </div>

            <div className="rounded-xl border border-border/70 bg-background/60 p-4 space-y-1">
              <span className="text-xs text-muted-foreground font-semibold">Delivery Status</span>
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                <Truck className="h-4 w-4 text-primary" /> Standard Express (2–4 Days)
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-muted/40 p-4 text-center space-y-2 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Need assistance with your order? Reach out to our 24/7 customer support team.
            </p>
          </div>
        </section>

        {/* Continue Shopping Button */}
        <div className="text-center pt-2">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <ShoppingBag className="h-5 w-5" /> Continue Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
