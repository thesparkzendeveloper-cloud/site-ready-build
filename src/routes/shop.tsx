import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SlidersHorizontal, Search } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Crumbs } from "@/components/site/Crumbs";
import { ProductCard } from "@/components/site/ProductCard";
import {
  categories as fallbackCategories,
  products as fallbackProducts,
  getProductsAsync,
  getCategoriesAsync,
  type Product,
} from "@/lib/products";

interface ShopSearch {
  category?: string | undefined;
  size?: string | undefined;
  color?: string | undefined;
  maxPrice?: number | undefined;
  search?: string | undefined;
  sort?: string | undefined;
}

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => {
    return {
      category: typeof search["category"] === "string" ? search["category"] : undefined,
      size: typeof search["size"] === "string" ? search["size"] : undefined,
      color: typeof search["color"] === "string" ? search["color"] : undefined,
      maxPrice: search["maxPrice"] ? Number(search["maxPrice"]) : undefined,
      search: typeof search["search"] === "string" ? search["search"] : undefined,
      sort: typeof search["sort"] === "string" ? search["sort"] : undefined,
    };
  },
  loader: async () => {
    const [products, categories] = await Promise.all([getProductsAsync(), getCategoriesAsync()]);
    return { products, categories };
  },
  head: () => ({
    meta: [
      { title: "Shop All Streetwear — SparkZen Clothing" },
      {
        name: "description",
        content:
          "Browse every SparkZen piece: hoodies, oversized tees, sweatshirts, caps and accessories. Filter by category, size, colour and price.",
      },
      { property: "og:title", content: "Shop All Streetwear — SparkZen Clothing" },
      {
        property: "og:description",
        content: "Hoodies, oversized tees, sweatshirts and accessories from SparkZen.",
      },
    ],
  }),
  component: Shop,
});

const sizes = ["S", "M", "L", "XL", "XXL"];
const colors = [
  ["Black", "oklch(0.16 0.008 40)"],
  ["Red", "oklch(0.53 0.216 27.5)"],
  ["White", "oklch(0.99 0 0)"],
  ["Grey", "oklch(0.72 0.008 70)"],
  ["Beige", "oklch(0.88 0.03 85)"],
];

function Shop() {
  const { products: loadedProducts, categories: loadedCategories } = Route.useLoaderData();
  const searchParams = Route.useSearch();

  const [productList, setProductList] = useState<Product[]>(
    loadedProducts && loadedProducts.length > 0 ? loadedProducts : fallbackProducts
  );
  const [categoryList, setCategoryList] = useState<Array<{ name: string; count: number }>>(
    loadedCategories && loadedCategories.length > 0 ? loadedCategories : fallbackCategories
  );

  const [activeCategory, setActiveCategory] = useState<string>(searchParams.category || "All Products");
  const [sizeFilter, setSizeFilter] = useState<string | null>(searchParams.size || null);
  const [colorFilter, setColorFilter] = useState<string | null>(searchParams.color || null);
  const [maxPrice, setMaxPrice] = useState<number>(searchParams.maxPrice || 10000);
  const [sort, setSort] = useState<string>(searchParams.sort || "featured");
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.search || "");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  useEffect(() => {
    if (loadedProducts && loadedProducts.length > 0) {
      setProductList(loadedProducts);
    }
    if (loadedCategories && loadedCategories.length > 0) {
      setCategoryList(loadedCategories);
    }
  }, [loadedProducts, loadedCategories]);

  useEffect(() => {
    setActiveCategory(searchParams.category || "All Products");
    setSizeFilter(searchParams.size || null);
    setColorFilter(searchParams.color || null);
    setMaxPrice(searchParams.maxPrice || 10000);
    setSearchQuery(searchParams.search || "");
    setSort(searchParams.sort || "featured");
  }, [searchParams]);

  let list = productList.filter((p) => {
    const matchesCategory =
      activeCategory === "All Products" ||
      p.category.toLowerCase() === activeCategory.toLowerCase() ||
      p.productType?.toLowerCase() === activeCategory.toLowerCase() ||
      p.name.toLowerCase().includes(activeCategory.toLowerCase());

    const matchesSize =
      !sizeFilter ||
      (() => {
        if (p.sizes && p.sizes.length > 0) return p.sizes.includes(sizeFilter);
        if (p.options && p.options.length > 0) {
          const sizeOpt = p.options.find((opt) => opt.name.toLowerCase() === "size");
          if (sizeOpt) return sizeOpt.values.includes(sizeFilter);
        }
        if (p.variants && p.variants.length > 0) {
          return p.variants.some((v) =>
            v.selectedOptions?.some(
              (opt) => opt.name.toLowerCase() === "size" && opt.value === sizeFilter
            )
          );
        }
        const isAccessory =
          p.category.toLowerCase().includes("accessories") ||
          p.category.toLowerCase().includes("cap") ||
          p.name.toLowerCase().includes("keychain") ||
          p.name.toLowerCase().includes("tote");
        return !isAccessory;
      })();

    const matchesColor =
      !colorFilter ||
      (() => {
        if (p.colors && p.colors.length > 0) {
          return p.colors.some((c) => c.toLowerCase() === colorFilter.toLowerCase());
        }
        if (p.options && p.options.length > 0) {
          const colorOpt = p.options.find(
            (opt) => opt.name.toLowerCase() === "color" || opt.name.toLowerCase() === "colour"
          );
          if (colorOpt) return colorOpt.values.some((v) => v.toLowerCase() === colorFilter.toLowerCase());
        }
        if (p.variants && p.variants.length > 0) {
          return p.variants.some((v) =>
            v.selectedOptions?.some(
              (opt) =>
                (opt.name.toLowerCase() === "color" || opt.name.toLowerCase() === "colour") &&
                opt.value.toLowerCase() === colorFilter.toLowerCase()
            )
          );
        }
        return true;
      })();

    const matchesPrice = p.price <= maxPrice;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      matchesCategory &&
      matchesSize &&
      matchesColor &&
      matchesPrice &&
      matchesSearch
    );
  });

  if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);

  return (
    <SiteLayout>
      <Crumbs items={[{ label: "Home", to: "/" }, { label: "Shop All" }]} />

      <header className="panel-ink mt-4 rounded-2xl px-6 py-8">
        <p className="eyebrow">Full Catalogue</p>
        <h1 className="mt-2 text-3xl text-ink-foreground sm:text-4xl">Shop All</h1>
        <p className="mt-2 max-w-lg text-sm text-ink-muted">
          Every piece we make, in one place. Filter it down to exactly your fit.
        </p>
      </header>

      {/* Main Category Bar (Placed directly under header banner) */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categoryList.map((c) => (
          <button
            key={c.name}
            onClick={() => setActiveCategory(c.name)}
            className={`whitespace-nowrap shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeCategory === c.name
                ? "bg-primary text-primary-foreground shadow-sm scale-105"
                : "bg-surface border border-border text-foreground hover:border-primary hover:bg-muted/50"
            }`}
          >
            {c.name} <span className="text-[11px] opacity-70">({c.count})</span>
          </button>
        ))}
      </div>

      <div className="mt-6 lg:mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar (Desktop) */}
        <aside className="hidden lg:block space-y-7">
          <section>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.16em]">Price</h2>
            <input
              type="range"
              min={299}
              max={10000}
              step={100}
              value={maxPrice}
              aria-label="Maximum price"
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-4 w-full accent-primary"
            />
            <p className="mt-1 text-sm text-muted-foreground">Up to ₹{maxPrice}</p>
          </section>

          <section>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.16em]">Size</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSizeFilter(sizeFilter === s ? null : s)}
                  className={`h-9 w-11 rounded-lg border text-sm font-bold transition-colors cursor-pointer ${
                    sizeFilter === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.16em]">Colour</h2>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {colors.map(([name, value]) => (
                <button
                  key={name}
                  onClick={() => setColorFilter(colorFilter === name ? null : (name ?? null))}
                  aria-label={name}
                  title={name}
                  className={`h-7 w-7 rounded-full ring-2 transition-transform hover:scale-110 cursor-pointer ${
                    colorFilter === name ? "ring-primary scale-110" : "ring-border"
                  }`}
                  style={{ background: value }}
                />
              ))}
            </div>
          </section>
        </aside>

        {/* Product Grid */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-bold text-foreground">{list.length}</span> products
              </p>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setMobileFiltersOpen((v) => !v)}
                className="flex items-center gap-2 text-xs font-bold border border-border rounded-lg px-3 py-1.5 lg:hidden hover:bg-muted cursor-pointer"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                <span>{mobileFiltersOpen ? "Hide Filters" : "Filters"}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <label className="flex items-center gap-2 text-sm shrink-0">
                <SlidersHorizontal className="h-4 w-4 text-primary hidden sm:inline" />
                <span className="sr-only">Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                </select>
              </label>
            </div>
          </div>

          {/* Mobile Filters Collapsible Drawer */}
          {mobileFiltersOpen && (
            <div className="mt-4 p-4 rounded-xl border border-border bg-muted/40 space-y-5 lg:hidden">
              <section>
                <h3 className="text-xs font-extrabold uppercase tracking-[0.16em]">Category</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {categoryList.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setActiveCategory(c.name)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        activeCategory === c.name
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-background border border-border text-foreground hover:border-primary"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-extrabold uppercase tracking-[0.16em]">Price</h3>
                <input
                  type="range"
                  min={299}
                  max={10000}
                  step={100}
                  value={maxPrice}
                  aria-label="Maximum price"
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="mt-3 w-full accent-primary"
                />
                <p className="mt-1 text-sm text-muted-foreground">Up to ₹{maxPrice}</p>
              </section>

              <section>
                <h3 className="text-xs font-extrabold uppercase tracking-[0.16em]">Size</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSizeFilter(sizeFilter === s ? null : s)}
                      className={`h-8 w-10 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                        sizeFilter === s
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-extrabold uppercase tracking-[0.16em]">Colour</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {colors.map(([name, value]) => (
                    <button
                      key={name}
                      onClick={() => setColorFilter(colorFilter === name ? null : (name ?? null))}
                      aria-label={name}
                      title={name}
                      className={`h-7 w-7 rounded-full ring-2 transition-transform cursor-pointer ${
                        colorFilter === name ? "ring-primary scale-110" : "ring-border"
                      }`}
                      style={{ background: value }}
                    />
                  ))}
                </div>
              </section>
            </div>
          )}

          {list.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No products match these filters.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
