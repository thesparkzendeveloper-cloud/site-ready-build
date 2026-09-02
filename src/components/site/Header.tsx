import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ShoppingCart, Menu, ChevronDown, ChevronRight, Sparkles, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Logo } from "./Logo";
import { useCart } from "@/context/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getProductsAsync, products as fallbackProducts, formatPrice, type Product } from "@/lib/products";

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

export function Header() {
  const [open, setOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  // Search Modal State
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>(fallbackProducts);

  // Mobile Filter States
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(10000);

  const navigate = useNavigate();
  const { totalQuantity, openCart } = useCart();

  useEffect(() => {
    getProductsAsync().then((prods) => {
      if (prods && prods.length > 0) {
        setAllProducts(prods);
      }
    });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      navigate({
        to: "/shop",
        search: { search: searchQuery.trim() },
      });
    }
  };

  const handleQuickTagClick = (tag: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate({
      to: "/shop",
      search: { search: tag },
    });
  };

  const matchingProducts = searchQuery.trim()
    ? allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

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
    if (selectedColor) searchObj["color"] = selectedColor;
    if (maxPrice < 10000) searchObj["maxPrice"] = maxPrice;

    navigate({
      to: "/shop",
      search: searchObj,
    });
  };

  const handleClearFilters = () => {
    setSelectedSize(null);
    setSelectedColor(null);
    setMaxPrice(10000);
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
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="p-2 rounded-full text-foreground/80 hover:text-primary hover:bg-muted/60 transition-all cursor-pointer"
          >
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

      {/* Interactive Search Modal */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-border bg-background shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Search Products</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSearchSubmit} className="relative border-b border-border p-4 flex items-center gap-3 bg-surface">
            <Search className="h-5 w-5 text-primary shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search hoodies, oversized tees, caps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer px-2"
              >
                Clear
              </button>
            )}
          </form>

          <div className="p-5 space-y-5">
            {/* Quick Category Tags */}
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-2.5">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {["Hoodie", "Oversized", "Tee", "Sweatshirt", "Cap"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleQuickTagClick(tag)}
                    className="rounded-full bg-muted px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Instant Search Results */}
            {searchQuery.trim() && (
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-3">
                  Matching Products ({matchingProducts.length})
                </p>

                {matchingProducts.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No products found matching "{searchQuery}"
                  </p>
                ) : (
                  <div className="grid gap-2">
                    {matchingProducts.map((p) => (
                      <button
                        key={p.slug}
                        type="button"
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                          navigate({ to: "/product/$slug", params: { slug: p.slug } });
                        }}
                        className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-muted transition-colors text-left w-full cursor-pointer group"
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-12 w-12 rounded-lg object-cover bg-muted shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                            {p.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{p.category}</p>
                        </div>
                        <span className="text-sm font-extrabold text-primary shrink-0">
                          {formatPrice(p.price, p.currencyCode)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-border mt-3">
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="w-full text-center text-xs font-bold text-primary hover:underline cursor-pointer py-1"
                  >
                    View all results for "{searchQuery}" →
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
                  {(selectedSize || selectedColor || maxPrice < 10000) && (
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
