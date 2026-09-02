import { Link } from "@tanstack/react-router";
import { Instagram, Youtube, Music2, ArrowRight } from "lucide-react";
import { Logo } from "./Logo";

interface FooterLink {
  label: string;
  to: "/" | "/shop" | "/about" | "/contact" | "/customization";
  search?: Record<string, string>;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const columns: FooterColumn[] = [
  {
    title: "Shop",
    links: [
      { label: "All Products", to: "/shop" },
      { label: "Hoodies", to: "/shop", search: { category: "Hoodies" } },
      { label: "T-Shirts", to: "/shop", search: { category: "T-Shirts" } },
      { label: "Oversized Tees", to: "/shop", search: { category: "Oversized Tees" } },
      { label: "Sweatshirts", to: "/shop", search: { category: "Sweatshirts" } },
      { label: "Accessories", to: "/shop", search: { category: "Accessories" } },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Our Story", to: "/about" },
      { label: "Customization", to: "/customization" },
      { label: "Size Guide", to: "/customization" },
      { label: "Contact Us", to: "/contact" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Customer Support", to: "/contact" },
      { label: "FAQs", to: "/contact" },
      { label: "Shipping & Returns", to: "/contact" },
      { label: "Track Your Order", to: "/contact" },
      { label: "Terms & Conditions", to: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="panel-ink mt-6 rounded-t-2xl sm:rounded-t-3xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid gap-6 sm:gap-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2 space-y-2.5">
            <Logo tone="light" />
            <p className="max-w-xs text-xs sm:text-sm text-ink-muted leading-relaxed">
              Streetwear that speaks your vibe. Premium quality. Limited editions.
            </p>
            <div className="flex gap-3 text-ink-foreground/80 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-primary transition-colors p-1"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" aria-label="TikTok" className="hover:text-primary transition-colors p-1">
                <Music2 className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="hover:text-primary transition-colors p-1"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-foreground">
                {col.title}
              </h3>
              <ul className="mt-2.5 space-y-1.5 text-xs text-ink-muted">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.search ? (
                      <Link
                        to={link.to}
                        search={link.search}
                        className="transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <Link
                        to={link.to}
                        className="transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Box */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-foreground">
              Newsletter
            </h3>
            <p className="mt-2.5 text-xs text-ink-muted leading-snug">
              Subscribe for exclusive drops and special offers.
            </p>
            <form
              className="mt-3 flex items-center gap-1.5 rounded-full bg-ink-foreground/10 p-1 ring-1 ring-ink-foreground/15"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder="Enter email"
                aria-label="Email address"
                className="w-full bg-transparent px-3 text-xs text-ink-foreground placeholder:text-ink-muted focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground hover:scale-105 transition-transform"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-ink-foreground/10 pt-4 text-[11px] text-ink-muted">
          <p>© 2026 SparkZen Clothing. All rights reserved.</p>
          <div className="flex items-center gap-4 font-bold tracking-wide text-ink-foreground/70">
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
