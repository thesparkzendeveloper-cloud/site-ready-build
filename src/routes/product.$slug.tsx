import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Star, ShoppingCart, Truck, RefreshCw, ShieldCheck, Plus } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Crumbs } from "@/components/site/Crumbs";
import { ProductCard } from "@/components/site/ProductCard";
import { getProduct, products, formatPrice, type Product } from "@/lib/products";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Product not found — SparkZen" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    const title = `${product.name} — SparkZen Clothing`;
    return {
      meta: [
        { title },
        { name: "description", content: product.description.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: product.description.slice(0, 155) },
      ],
    };
  },
  component: ProductPage,
});

const sizes = ["S", "M", "L", "XL", "XXL"];
const swatches = [
  ["Black", "oklch(0.16 0.008 40)"],
  ["Red", "oklch(0.53 0.216 27.5)"],
  ["Off White", "oklch(0.95 0.01 85)"],
];

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  const [image, setImage] = useState(product.gallery[0]!);
  const [size, setSize] = useState("M");
  const [color, setColor] = useState("Black");

  const bundle = products.filter((p) => p.slug !== product.slug).slice(0, 3);
  const bundleTotal = product.price + bundle.reduce((sum, p) => sum + p.price, 0);

  return (
    <SiteLayout>
      <Crumbs
        items={[{ label: "Home", to: "/" }, { label: "Shop", to: "/shop" }, { label: product.name }]}
      />

      <div className="mt-5 grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="overflow-hidden rounded-2xl bg-muted">
            <img
              src={image}
              alt={product.name}
              className="aspect-4/5 w-full object-cover"
            />
          </div>
          <div className="mt-3 flex gap-3">
            {product.gallery.map((g, i) => (
              <button
                key={i}
                onClick={() => setImage(g)}
                aria-label={`View image ${i + 1}`}
                className={`h-20 w-16 overflow-hidden rounded-lg ring-2 transition-all ${
                  image === g ? "ring-primary" : "ring-transparent hover:ring-border"
                }`}
              >
                <img src={g} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Buy box */}
        <div>
          <p className="eyebrow">{product.category}</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="flex text-primary">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </span>
            <span className="font-bold">{product.rating}</span>
            <span className="text-muted-foreground">
              ({product.reviews.toLocaleString("en-IN")} reviews)
            </span>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <span className="text-3xl font-extrabold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.compareAt && (
              <>
                <span className="pb-1 text-sm text-muted-foreground line-through">
                  {formatPrice(product.compareAt)}
                </span>
                <span className="mb-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                  {Math.round((1 - product.price / product.compareAt) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-7">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.16em]">
              Colour: <span className="text-primary">{color}</span>
            </h2>
            <div className="mt-3 flex gap-3">
              {swatches.map(([name, value]) => (
                <button
                  key={name}
                  onClick={() => setColor(name)}
                  aria-label={name}
                  className={`h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all ${
                    color === name ? "ring-primary" : "ring-border"
                  }`}
                  style={{ background: value }}
                />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.16em]">Select Size</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`h-11 w-14 rounded-xl border text-sm font-bold transition-colors ${
                    size === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-bold text-ink-foreground transition-colors hover:bg-ink/90">
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </button>
            <button
              className="inline-flex flex-1 items-center justify-center rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
              style={{ boxShadow: "var(--shadow-glow)" }}
            >
              Buy Now
            </button>
          </div>

          <ul className="mt-7 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            {[
              [Truck, "Free shipping over ₹999"],
              [RefreshCw, "7-day easy returns"],
              [ShieldCheck, "100% authentic"],
            ].map(([Icon, text], i) => {
              const I = Icon as typeof Truck;
              return (
                <li key={i} className="flex items-center gap-2">
                  <I className="h-4 w-4 shrink-0 text-primary" />
                  {text as string}
                </li>
              );
            })}
          </ul>

          <div className="surface-card mt-7 rounded-2xl p-5">
            <h2 className="text-sm font-extrabold">Product Details</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>· Premium heavyweight fabric, 320 GSM</li>
              <li>· Oversized relaxed fit with drop shoulders</li>
              <li>· Reflective screen print, crack-resistant</li>
              <li>· Ribbed cuffs and hem with kangaroo pocket</li>
              <li>· Machine wash cold, inside out</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Frequently bought together */}
      <section className="mt-16">
        <h2 className="text-2xl sm:text-3xl">Frequently Bought Together</h2>
        <div className="surface-card mt-6 flex flex-col gap-6 rounded-2xl p-6 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-wrap items-center gap-4">
            {[product, ...bundle].map((p, i) => (
              <div key={p.slug} className="flex items-center gap-4">
                {i > 0 && <Plus className="h-4 w-4 text-primary" />}
                <div className="w-28">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                  <p className="mt-2 text-xs font-bold">{p.name}</p>
                  <p className="text-xs text-primary">{formatPrice(p.price)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:w-56">
            <p className="text-sm text-muted-foreground">Bundle total</p>
            <p className="text-2xl font-extrabold text-primary">{formatPrice(bundleTotal)}</p>
            <button className="mt-3 w-full rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
              Add all to cart
            </button>
          </div>
        </div>
      </section>

      {/* You may also like */}
      <section className="mt-16">
        <h2 className="text-2xl sm:text-3xl">You May Also Like</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products
            .filter((p) => p.slug !== product.slug)
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
        </div>
      </section>
    </SiteLayout>
  );
}
