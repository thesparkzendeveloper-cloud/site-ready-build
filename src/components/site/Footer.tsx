import { Link } from "@tanstack/react-router";
import { Instagram, Youtube, Music2, ArrowRight } from "lucide-react";
import { Logo } from "./Logo";

const columns = [
  {
    title: "Shop",
    links: [
      "All Products",
      "Hoodies",
      "T-Shirts",
      "Oversized Tees",
      "Sweatshirts",
      "New Arrivals",
    ],
    to: "/shop" as const,
  },
  {
    title: "Company",
    links: ["About Us", "Our Story", "Size Guide", "Shipping & Returns", "FAQs", "Contact Us"],
    to: "/about" as const,
  },
  {
    title: "Help",
    links: [
      "Customer Support",
      "Track Your Order",
      "Returns & Support",
      "Terms & Conditions",
      "Privacy Policy",
    ],
    to: "/contact" as const,
  },
];

export function Footer() {
  return (
    <footer className="panel-ink mt-6 rounded-t-3xl">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo tone="light" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-muted">
              Streetwear that speaks your vibe. Premium quality. Limited editions.
            </p>
            <div className="mt-5 flex gap-4 text-ink-foreground/80">
              <a href="#" aria-label="Instagram" className="hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" aria-label="TikTok" className="hover:text-primary">
                <Music2 className="h-5 w-5" />
              </a>
              <a href="#" aria-label="YouTube" className="hover:text-primary">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-foreground">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link to={col.to} className="transition-colors hover:text-primary">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-foreground">
              Newsletter
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form
              className="mt-4 flex items-center gap-2 rounded-full bg-ink-foreground/10 p-1.5 ring-1 ring-ink-foreground/15"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder="Enter your email"
                aria-label="Email address"
                className="w-full bg-transparent px-3 text-sm text-ink-foreground placeholder:text-ink-muted focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-foreground/10 pt-6 text-xs text-ink-muted sm:flex-row">
          <p>© 2026 SparkZen Clothing. All rights reserved.</p>
          <div className="flex items-center gap-5 font-bold tracking-wide text-ink-foreground/70">
            <span>VISA</span>
            <span>MASTERCARD</span>
            <span>UPI</span>
            <span>PAYTM</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
