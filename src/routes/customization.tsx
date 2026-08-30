import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Sparkles, Shirt, Scissors, PackageCheck, ExternalLink, ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Crumbs } from "@/components/site/Crumbs";

export const Route = createFileRoute("/customization")({
  head: () => ({
    meta: [
      { title: "Customization | SparkZen" },
      {
        name: "description",
        content:
          "Have a custom requirement? Chat directly with SparkZen on WhatsApp for custom orders, bulk streetwear requirements, prints, and pricing.",
      },
    ],
  }),
  component: CustomizationPage,
});

const WHATSAPP_NUMBER = "919363447850";
const PREFILLED_MESSAGE = encodeURIComponent("Hi SparkZen, I would like to enquire about customization.");
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${PREFILLED_MESSAGE}`;

function CustomizationPage() {
  return (
    <SiteLayout>
      <Crumbs items={[{ label: "Home", to: "/" }, { label: "Customization" }]} />

      <div className="mt-6 max-w-4xl mx-auto space-y-8">
        {/* Page Hero Header */}
        <header className="panel-ink rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/20 text-primary border border-primary/40">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>

          <p className="eyebrow mt-5">Bespoke & Wholesale Streetwear</p>
          <h1 className="mt-2 text-3xl sm:text-4xl text-ink-foreground font-extrabold tracking-tight">
            Customize Your Style
          </h1>
          <p className="mt-3 text-sm sm:text-base text-ink-muted max-w-xl mx-auto leading-relaxed">
            Have a custom requirement? Tell us what you need and our team will help you create your unique vision.
          </p>
        </header>

        {/* Prominent WhatsApp Enquiry Card */}
        <section className="surface-card rounded-3xl p-8 sm:p-12 border-2 border-primary/40 shadow-xl relative overflow-hidden text-center space-y-6">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/30">
            <MessageCircle className="h-10 w-10 text-emerald-500" />
          </div>

          <div className="space-y-3 max-w-lg mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-4 py-1 text-xs font-extrabold text-emerald-500 uppercase tracking-widest">
              Direct Support
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              WhatsApp Enquiry
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Chat with our team directly on WhatsApp for custom orders, bulk requirements, product customization, pricing and other enquiries.
            </p>
          </div>

          {/* WhatsApp Direct CTA Button */}
          <div className="pt-2">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-primary px-8 py-4 text-base sm:text-lg font-bold text-primary-foreground shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.98] w-full sm:w-auto"
              style={{ boxShadow: "var(--shadow-glow)" }}
            >
              <MessageCircle className="h-6 w-6" />
              <span>Chat on WhatsApp</span>
              <ExternalLink className="h-4 w-4 opacity-80" />
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border/60">
            <span className="font-mono font-bold text-foreground">+91 9363447850</span>
            <span>•</span>
            <span>Instant Response</span>
            <span>•</span>
            <span>Custom Prints & Fits</span>
          </div>
        </section>

        {/* Customization Options Grid */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="surface-card rounded-2xl p-6 border border-border space-y-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <Shirt className="h-6 w-6" />
            </div>
            <h3 className="text-base font-extrabold text-foreground">Custom Prints</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Puff prints, screen printing, high-density graphics, and embroidery on heavy GSM cotton fabrics.
            </p>
          </div>

          <div className="surface-card rounded-2xl p-6 border border-border space-y-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <Scissors className="h-6 w-6" />
            </div>
            <h3 className="text-base font-extrabold text-foreground">Tailored Sizing</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Custom oversized cuts, boxy fits, drop-shoulder silhouettes, and altered lengths built to your spec.
            </p>
          </div>

          <div className="surface-card rounded-2xl p-6 border border-border space-y-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <PackageCheck className="h-6 w-6" />
            </div>
            <h3 className="text-base font-extrabold text-foreground">Bulk & Corporate</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Wholesale pricing and dedicated support for brand merch, team apparel, and large quantity orders.
            </p>
          </div>
        </div>

        {/* Guarantee Banner */}
        <section className="surface-card rounded-2xl p-6 border border-border flex items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
            <span>All custom orders are handled with 100% premium quality control and fast dispatch.</span>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
