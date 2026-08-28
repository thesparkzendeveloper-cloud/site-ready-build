import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
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

export const Route = createFileRoute("/shop")({
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
  const [productList, setProductList] = useState<Product[]>(
    loadedProducts && loadedProducts.length > 0 ? loadedProducts : fallbackProducts
  );
  const [categoryList, setCategoryList] = useState<Array<{ name: string; count: number }>>(
    loadedCategories && loadedCategories.length > 0 ? loadedCategories : fallbackCategories
  );
  const [active, setActive] = useState("All Products");
  const [size, setSize] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    if (loadedProducts && loadedProducts.length > 0) {
      setProductList(loadedProducts);
    }
    if (loadedCategories && loadedCategories.length > 0) {
      setCategoryList(loadedCategories);
    }
  }, [loadedProducts, loadedCategories]);

  let list = productList.filter(
    (p) => (active === "All Products" || p.category === active) && p.price <= maxPrice
  );
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
        {/* Sidebar */}
        <aside className="space-y-7">
          <section>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.16em]">Categories</h2>
            <ul className="mt-3 space-y-1">
              {categoryList.map((c) => (
                <li key={c.name}>
                  <button
                    onClick={() => setActive(c.name)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                      active === c.name
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
              max={2000}
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
                  onClick={() => setSize(size === s ? null : s)}
                  className={`h-9 w-11 rounded-lg border text-sm font-bold transition-colors ${
                    size === s
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
                  aria-label={name}
                  title={name}
                  className="h-7 w-7 rounded-full ring-1 ring-border transition-transform hover:scale-110"
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
                  <label className="flex items-center gap-2 text-muted-foreground">
                    <input type="checkbox" className="accent-primary" /> {m}
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.16em]">Availability</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-primary" defaultChecked /> In stock
                </label>
              </li>
              <li>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-primary" /> Pre-order
                </label>
              </li>
            </ul>
          </section>
        </aside>

        {/* Grid */}
        <div>
          <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-bold text-foreground">{list.length}</span> products
            </p>
            <label className="flex items-center gap-2 text-sm">
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

          {list.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No products match these filters.
            </p>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
