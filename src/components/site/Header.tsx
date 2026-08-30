import { Link } from "@tanstack/react-router";
import { Search, ShoppingCart, Menu, ChevronRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { useCart } from "@/context/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const nav = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Customization", to: "/customization" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { totalQuantity, openCart } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Desktop Navbar */}
        <nav className="hidden items-center gap-7 text-sm font-semibold lg:flex">
          {nav.map((item, i) => (
            <Link
              key={item.label + i}
              to={item.to}
              className="text-foreground/80 transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Hamburger Trigger */}
        <button
          className="lg:hidden p-2 rounded-lg text-foreground/80 hover:text-primary transition-colors cursor-pointer"
          aria-label="Open mobile navigation menu"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Brand Logo */}
        <div className="lg:absolute lg:left-1/2 lg:-translate-x-1/2">
          <Logo />
        </div>

        {/* Cart & Search Actions */}
        <div className="flex items-center gap-3">
          <button aria-label="Search" className="text-foreground/80 hover:text-primary">
            <Search className="h-5 w-5" />
          </button>
          <span className="hidden h-8 w-8 rounded-full bg-muted ring-1 ring-border sm:block" />
          <button
            onClick={openCart}
            aria-label="View Cart"
            className="inline-flex items-center gap-2 rounded-full border border-primary px-3.5 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground cursor-pointer"
          >
            <ShoppingCart className="h-4 w-4" />
            {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
          </button>
        </div>
      </div>

      {/* Mobile Catalogue Left Slide-Out Drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="flex w-[82vw] max-w-xs sm:max-w-sm flex-col p-0 bg-background border-r border-border"
        >
          {/* Drawer Header with SparkZen Logo */}
          <SheetHeader className="border-b border-border/80 px-5 py-4 text-left">
            <SheetTitle className="flex items-center justify-between">
              <Logo />
            </SheetTitle>
          </SheetHeader>

          {/* Navigation Items (Catalogue Style) */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            <p className="px-3 text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground mb-2">
              Navigation
            </p>

            {nav.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl px-3.5 py-3.5 text-base font-bold text-foreground hover:bg-muted/60 hover:text-primary transition-all active:scale-[0.98]"
              >
                <span>{item.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
              </Link>
            ))}

            <div className="pt-6">
              <div className="surface-card rounded-2xl p-4 border border-border space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span>Streetwear Collection</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bespoke cuts, heavy GSM cotton tees, & limited hoodie drops.
                </p>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="border-t border-border px-5 py-4 text-xs text-muted-foreground text-center">
            © 2026 SparkZen Clothing
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
