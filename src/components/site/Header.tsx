import { Link } from "@tanstack/react-router";
import { Search, ShoppingCart, Menu } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";

const nav = [
  { label: "Shop", to: "/shop" },
  { label: "New In", to: "/shop" },
  { label: "Collections", to: "/shop" },
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <nav className="hidden items-center gap-7 text-sm font-semibold lg:flex">
          {nav.map((item, i) => (
            <Link
              key={item.label + i}
              to={item.to}
              className="text-foreground/80 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: true }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          className="lg:hidden"
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="lg:absolute lg:left-1/2 lg:-translate-x-1/2">
          <Logo />
        </div>

        <div className="flex items-center gap-3">
          <button aria-label="Search" className="text-foreground/80 hover:text-primary">
            <Search className="h-5 w-5" />
          </button>
          <span className="hidden h-8 w-8 rounded-full bg-muted ring-1 ring-border sm:block" />
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-primary px-3.5 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <ShoppingCart className="h-4 w-4" />
            1 item
          </Link>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-4 py-3 lg:hidden">
          {nav.map((item, i) => (
            <Link
              key={item.label + i}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-semibold text-foreground/80"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
