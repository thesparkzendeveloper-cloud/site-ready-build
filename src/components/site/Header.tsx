import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ShoppingCart, Menu, ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { useCart } from "@/context/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const categoriesList = [
  "Polo T-Shirts",
  "Round Neck T-Shirts",
  "Kids T-Shirts",
  "Women's T-Shirts",
  "Hoodies",
  "Oversized T-Shirts",
];

const sizesList = ["S", "M", "L", "XL", "XXL"];
const colorsList = [
  ["Black", "oklch(0.16 0.008 40)"],
  ["Red", "oklch(0.53 0.216 27.5)"],
  ["White", "oklch(0.99 0 0)"],
  ["Grey", "oklch(0.72 0.008 70)"],
  ["Beige", "oklch(0.88 0.03 85)"],
];
const materialsList = ["Cotton", "Fleece", "French Terry", "Polyester Blend"];

export function Header() {
  const [open, setOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [materialOpen, setMaterialOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);

  // Mobile Filter States
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  const navigate = useNavigate();
  const { totalQuantity, openCart } = useCart();

  const handleCategoryClick = (cat: string) => {
    setOpen(false);
    navigate({
      to: "/shop",
      search: { category: cat },
    });
  };

  const handleApplyFilters = () => {
    setOpen(false);
    const searchObj: Record<string, string | number | boolean> = {};
    if (selectedSize) searchObj["size"] = selectedSize;
    if (selectedMaterial) searchObj["material"] = selectedMaterial;
    if (selectedColor) searchObj["color"] = selectedColor;
    if (maxPrice < 10000) searchObj["maxPrice"] = maxPrice;
    if (inStockOnly) searchObj["inStock"] = true;

    navigate({
      to: "/shop",
      search: searchObj,
    });
  };

  const handleClearFilters = () => {
    setSelectedSize(null);
    setSelectedMaterial(null);
    setSelectedColor(null);
    setMaxPrice(10000);
    setInStockOnly(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Desktop Navbar - 100% Unchanged */}
        <nav className="hidden items-center gap-7 text-sm font-semibold lg:flex">
          <Link to="/" className="text-foreground/80 transition-colors hover:text-primary">
            Home
          </Link>
          <Link to="/shop" className="text-foreground/80 transition-colors hover:text-primary">
            Shop
          </Link>
          <Link to="/about" className="text-foreground/80 transition-colors hover:text-primary">
            About Us
          </Link>
          <Link to="/contact" className="text-foreground/80 transition-colors hover:text-primary">
            Contact
          </Link>
          <Link to="/customization" className="text-foreground/80 transition-colors hover:text-primary">
            Customization
          </Link>
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
          className="flex w-[85vw] max-w-xs sm:max-w-sm flex-col p-0 bg-background border-r border-border"
        >
          {/* Drawer Header with SparkZen Logo */}
          <SheetHeader className="border-b border-border/80 px-5 py-4 text-left">
            <SheetTitle className="flex items-center justify-between">
              <Logo />
            </SheetTitle>
          </SheetHeader>

          {/* Drawer Navigation List */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {/* Home */}
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-3.5 py-3 text-base font-bold text-foreground hover:bg-muted/60 hover:text-primary transition-all"
            >
              <span>Home</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
            </Link>

            {/* Shop */}
            <Link
              to="/shop"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-3.5 py-3 text-base font-bold text-foreground hover:bg-muted/60 hover:text-primary transition-all"
            >
              <span>Shop</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
            </Link>

            {/* Category Accordion */}
            <div className="border-y border-border/40 py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCategoryOpen((v) => !v);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-base font-bold text-foreground hover:bg-muted/60 hover:text-primary transition-all cursor-pointer"
              >
                <span>Category</span>
                {categoryOpen ? (
                  <ChevronDown className="h-4 w-4 text-primary" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                )}
              </button>

              {categoryOpen && (
                <div className="ml-3 mt-1 space-y-1 border-l-2 border-primary/30 pl-3 py-1">
                  {categoriesList.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      className="block w-full text-left rounded-lg px-3 py-2 text-sm font-semibold text-foreground/80 hover:bg-muted hover:text-primary transition-colors cursor-pointer"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Shop Filters Accordion */}
            <div className="border-b border-border/40 py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFiltersOpen((v) => !v);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-base font-bold text-foreground hover:bg-muted/60 hover:text-primary transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span>Shop Filters</span>
                  {(selectedSize || selectedMaterial || selectedColor || inStockOnly || maxPrice < 10000) && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </span>
                {filtersOpen ? (
                  <ChevronDown className="h-4 w-4 text-primary" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                )}
              </button>

              {filtersOpen && (
                <div className="ml-3 mt-1 space-y-2 border-l-2 border-primary/30 pl-3 py-2">
                  {/* Size Filter */}
                  <div>
                    <button
                      onClick={() => setSizeOpen((v) => !v)}
                      className="flex w-full items-center justify-between py-1.5 text-xs font-extrabold uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <span>Size {selectedSize && `(${selectedSize})`}</span>
                      {sizeOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                    {sizeOpen && (
                      <div className="mt-2 flex flex-wrap gap-1.5 pb-2">
                        {sizesList.map((s) => (
                          <button
                            key={s}
                            onClick={() => setSelectedSize(selectedSize === s ? null : s)}
                            className={`h-8 w-10 rounded-lg border text-xs font-bold transition-colors ${
                              selectedSize === s
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border hover:border-primary text-foreground"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Material Filter */}
                  <div>
                    <button
                      onClick={() => setMaterialOpen((v) => !v)}
                      className="flex w-full items-center justify-between py-1.5 text-xs font-extrabold uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <span>Material {selectedMaterial && `(${selectedMaterial})`}</span>
                      {materialOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                    {materialOpen && (
                      <div className="mt-2 space-y-1.5 pb-2">
                        {materialsList.map((m) => (
                          <label key={m} className="flex items-center gap-2 text-xs font-semibold text-foreground/80 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedMaterial === m}
                              onChange={(e) => setSelectedMaterial(e.target.checked ? m : null)}
                              className="accent-primary"
                            />
                            <span>{m}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Colour Filter */}
                  <div>
                    <button
                      onClick={() => setColorOpen((v) => !v)}
                      className="flex w-full items-center justify-between py-1.5 text-xs font-extrabold uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <span>Colour {selectedColor && `(${selectedColor})`}</span>
                      {colorOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                    {colorOpen && (
                      <div className="mt-2 flex flex-wrap gap-2 pb-2">
                        {colorsList.map(([name, hex]) => (
                          <button
                            key={name}
                            onClick={() => setSelectedColor(selectedColor === name ? null : (name ?? null))}
                            aria-label={name}
                            title={name}
                            className={`h-7 w-7 rounded-full ring-2 transition-transform ${
                              selectedColor === name ? "ring-primary scale-110" : "ring-border"
                            }`}
                            style={{ background: hex }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price Filter */}
                  <div>
                    <button
                      onClick={() => setPriceOpen((v) => !v)}
                      className="flex w-full items-center justify-between py-1.5 text-xs font-extrabold uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <span>Price (Up to ₹{maxPrice})</span>
                      {priceOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                    {priceOpen && (
                      <div className="mt-2 pb-2 space-y-1">
                        <input
                          type="range"
                          min={299}
                          max={10000}
                          step={100}
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(Number(e.target.value))}
                          className="w-full accent-primary"
                        />
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>₹299</span>
                          <span className="font-bold text-foreground">₹{maxPrice}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Availability Filter */}
                  <div>
                    <button
                      onClick={() => setAvailabilityOpen((v) => !v)}
                      className="flex w-full items-center justify-between py-1.5 text-xs font-extrabold uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <span>Availability</span>
                      {availabilityOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                    {availabilityOpen && (
                      <div className="mt-2 pb-2">
                        <label className="flex items-center gap-2 text-xs font-semibold text-foreground/80 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={inStockOnly}
                            onChange={(e) => setInStockOnly(e.target.checked)}
                            className="accent-primary"
                          />
                          <span>In stock only</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Filter Action Buttons */}
                  <div className="pt-3 flex gap-2">
                    <button
                      onClick={handleApplyFilters}
                      className="flex-1 rounded-lg bg-primary py-2 text-xs font-bold text-primary-foreground shadow-sm transition-transform active:scale-95 cursor-pointer"
                    >
                      Apply Filters
                    </button>
                    <button
                      onClick={handleClearFilters}
                      className="rounded-lg border border-border px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* About Us */}
            <Link
              to="/about"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-3.5 py-3 text-base font-bold text-foreground hover:bg-muted/60 hover:text-primary transition-all"
            >
              <span>About Us</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
            </Link>

            {/* Contact */}
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-3.5 py-3 text-base font-bold text-foreground hover:bg-muted/60 hover:text-primary transition-all"
            >
              <span>Contact</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
            </Link>

            {/* Customization */}
            <Link
              to="/customization"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-3.5 py-3 text-base font-bold text-foreground hover:bg-muted/60 hover:text-primary transition-all"
            >
              <span>Customization</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
            </Link>

            <div className="pt-4">
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
