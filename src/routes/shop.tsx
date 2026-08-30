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
  material?: string | undefined;
  maxPrice?: number | undefined;
  inStock?: boolean | undefined;
  search?: string | undefined;
  sort?: string | undefined;
}

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => {
    return {
      category: typeof search["category"] === "string" ? search["category"] : undefined,
      size: typeof search["size"] === "string" ? search["size"] : undefined,
      color: typeof search["color"] === "string" ? search["color"] : undefined,
      material: typeof search["material"] === "string" ? search["material"] : undefined,
      maxPrice: search["maxPrice"] ? Number(search["maxPrice"]) : undefined,
      inStock: search["inStock"] === "true" || search["inStock"] === true ? true : undefined,
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
          "Browse every SparkZen piece: hoodies, oversized tees, sweatshirts, caps and accessories. Filter by size, colour, price and material.",
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
const materials = ["Cotton", "Fleece", "French Terry", "Polyester Blend"];

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
  const [materialFilter, setMaterialFilter] = useState<string | null>(searchParams.material || null);
  const [maxPrice, setMaxPrice] = useState<number>(searchParams.maxPrice || 10000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(searchParams.inStock ?? false);
  const [sort, setSort] = useState<string>(searchParams.sort || "featured");
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.search || "");

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
    setMaterialFilter(searchParams.material || null);
    setMaxPrice(searchParams.maxPrice || 10000);
    setInStockOnly(Boolean(searchParams.inStock));
    setSearchQuery(searchParams.search || "");
    setSort(searchParams.sort || "featured");
  }, [searchParams]);

  let list = productList.filter((p) => {
    const matchesCategory =
      activeCategory === "All Products" ||
      p.category.toLowerCase() === activeCategory.toLowerCase() ||
      p.productType?.toLowerCase() === activeCategory.toLowerCase() ||
      p.name.toLowerCase().includes(activeCategory.toLowerCase());

    const matchesSize = !sizeFilter || (p.sizes && p.sizes.includes(sizeFilter));
    const matchesColor = !colorFilter || (p.colors && p.colors.includes(colorFilter));
    const matchesMaterial =
      !materialFilter || (p.material && p.material.toLowerCase().includes(materialFilter.toLowerCase()));
    const matchesPrice = p.price <= maxPrice;
    const matchesInStock = !inStockOnly || p.availableForSale !== false;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      matchesCategory &&
      matchesSize &&
      matchesColor &&
      matchesMaterial &&
      matchesPrice &&
      matchesInStock &&
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

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar (Desktop) */}
        <aside className="hidden lg:block space-y-7">
          <section>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.16em]">Categories</h2>
            <ul className="mt-3 space-y-1">
              {categoryList.map((c) => (
                <li key={c.name}>
                  <button
                    onClick={() => setActiveCategory(c.name)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                      activeCategory === c.name
                        ? "bg-primary font-bold text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-xs opacity-70">{c.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

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
                  className={`h-9 w-11 rounded-lg border text-sm font-bold transition-colors ${
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
                  className={`h-7 w-7 rounded-full ring-2 transition-transform hover:scale-110 ${
                    colorFilter === name ? "ring-primary scale-110" : "ring-border"
                  }`}
                  style={{ background: value }}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.16em]">Material</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {materials.map((m) => (
                <li key={m}>
                  <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={materialFilter === m}
                      onChange={(e) => setMaterialFilter(e.target.checked ? m : null)}
                      className="accent-primary"
                    />{" "}
                    {m}
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.16em]">Availability</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="accent-primary"
                  />{" "}
                  In stock
                </label>
              </li>
            </ul>
          </section>
        </aside>

        {/* Product Grid */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-bold text-foreground">{list.length}</span> products
            </p>

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
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <span className="sr-only">Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="featured">Featured</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                </select>
              </label>
            </div>
          </div>

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
