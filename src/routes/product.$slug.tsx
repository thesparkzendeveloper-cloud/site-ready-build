import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Star, ShoppingCart, Truck, RefreshCw, ShieldCheck, Plus } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Crumbs } from "@/components/site/Crumbs";
import { ProductCard } from "@/components/site/ProductCard";
import {
  getProduct,
  getProductAsync,
  products as fallbackProducts,
  formatPrice,
  type Product,
} from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const product = await getProductAsync(params.slug);
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

const defaultSizes = ["S", "M", "L", "XL", "XXL"];
const defaultSwatches: [string, string][] = [
  ["Black", "oklch(0.16 0.008 40)"],
  ["Red", "oklch(0.53 0.216 27.5)"],
  ["Off White", "oklch(0.95 0.01 85)"],
];

function ProductPage() {
  const { product: initialProduct } = Route.useLoaderData() as { product: Product };
  const [product, setProduct] = useState<Product>(initialProduct);
  const [image, setImage] = useState(initialProduct.gallery[0] || initialProduct.image);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("Black");
  const [selectedOptionsState, setSelectedOptionsState] = useState<Record<string, string>>({});

  const { addToCart, checkout } = useCart();

  useEffect(() => {
    setProduct(initialProduct);
    setImage(initialProduct.gallery[0] || initialProduct.image);

    // Initialize Shopify options state if available
    if (initialProduct.options && initialProduct.options.length > 0) {
      const initialMap: Record<string, string> = {};
      initialProduct.options.forEach((opt) => {
        if (opt.values.length > 0) {
          initialMap[opt.name] = opt.values[0]!;
        }
      });
      setSelectedOptionsState(initialMap);
    }
  }, [initialProduct]);

  // Find matching variant based on selected options or fallback
  const matchingVariant = product.variants?.find((v) => {
    if (!v.selectedOptions || v.selectedOptions.length === 0) return false;
    return v.selectedOptions.every(
      (opt) => selectedOptionsState[opt.name] === opt.value
    );
  }) || product.variants?.[0];

  const currentVariantId =
    matchingVariant?.id || product.variantId || `variant-${product.slug}`;
  const currentPrice = matchingVariant?.price || product.price;
  const currentCompareAt = matchingVariant?.compareAt || product.compareAt;
  const isAvailable = matchingVariant
    ? matchingVariant.availableForSale
    : product.availableForSale !== false;

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptionsState((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const handleAddToCart = () => {
    if (!isAvailable) {
      toast.error("This product variant is currently out of stock.");
      return;
    }

    const optionsArray = Object.entries(selectedOptionsState).map(([name, value]) => ({
      name,
      value,
    }));

    addToCart({
      variantId: currentVariantId,
      quantity: 1,
      title: product.name,
      handle: product.slug,
      price: currentPrice,
      image,
      selectedOptions: optionsArray.length > 0 ? optionsArray : [
        { name: "Size", value: selectedSize },
        { name: "Color", value: selectedColor },
      ],
    });
  };

  const navigate = useNavigate();

  const handleBuyNow = async () => {
    if (!isAvailable) {
      toast.error("This product variant is currently out of stock.");
      return;
    }

    const optionsArray = Object.entries(selectedOptionsState).map(([name, value]) => ({
      name,
      value,
    }));

    await addToCart({
      variantId: currentVariantId,
      quantity: 1,
      title: product.name,
      handle: product.slug,
      price: currentPrice,
      image,
      selectedOptions: optionsArray.length > 0 ? optionsArray : [
        { name: "Size", value: selectedSize },
        { name: "Color", value: selectedColor },
      ],
    });
    navigate({ to: "/checkout" });
  };

  const bundle = fallbackProducts.filter((p) => p.slug !== product.slug).slice(0, 3);
  const bundleTotal = currentPrice + bundle.reduce((sum, p) => sum + p.price, 0);

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
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
            {product.gallery.map((g, i) => (
              <button
                key={i}
                onClick={() => setImage(g)}
                aria-label={`View image ${i + 1}`}
                className={`h-20 w-16 shrink-0 overflow-hidden rounded-lg ring-2 transition-all cursor-pointer ${
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
              {formatPrice(currentPrice, product.currencyCode)}
            </span>
            {currentCompareAt && (
              <>
                <span className="pb-1 text-sm text-muted-foreground line-through">
                  {formatPrice(currentCompareAt, product.currencyCode)}
                </span>
                <span className="mb-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                  {Math.round((1 - currentPrice / currentCompareAt) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {/* Dynamic Shopify options or default controls */}
          {product.options && product.options.length > 0 ? (
            <div className="mt-7 space-y-6">
              {product.options.map((option) => (
                <div key={option.id}>
                  <h2 className="text-xs font-extrabold uppercase tracking-[0.16em]">
                    {option.name}:{" "}
                    <span className="text-primary">
                      {selectedOptionsState[option.name] || option.values[0]}
                    </span>
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {option.values.map((val) => {
                      const isSelected = selectedOptionsState[option.name] === val;
                      return (
                        <button
                          key={val}
                          onClick={() => handleOptionChange(option.name, val)}
                          className={`min-w-11 px-3 py-2 rounded-xl border text-sm font-bold transition-colors cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary"
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="mt-7">
                <h2 className="text-xs font-extrabold uppercase tracking-[0.16em]">
                  Colour: <span className="text-primary">{selectedColor}</span>
                </h2>
                <div className="mt-3 flex gap-3">
                  {defaultSwatches.map(([name, value]) => (
                    <button
                      key={name}
                      onClick={() => setSelectedColor(name)}
                      aria-label={name}
                      className={`h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all cursor-pointer ${
                        selectedColor === name ? "ring-primary" : "ring-border"
                      }`}
                      style={{ background: value }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-xs font-extrabold uppercase tracking-[0.16em]">Select Size</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {defaultSizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`h-11 w-14 rounded-xl border text-sm font-bold transition-colors cursor-pointer ${
                        selectedSize === s
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleAddToCart}
              disabled={!isAvailable}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-bold text-ink-foreground transition-colors hover:bg-ink/90 disabled:opacity-50 cursor-pointer"
            >
              <ShoppingCart className="h-4 w-4" /> {isAvailable ? "Add to Cart" : "Out of Stock"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!isAvailable}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
              style={{ boxShadow: "var(--shadow-glow)" }}
            >
              {isAvailable ? "Buy Now" : "Out of Stock"}
            </button>
          </div>

          <ul className="mt-7 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            {[
              [Truck, "Free shipping over ₹999"],
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
                  <p className="text-xs text-primary">{formatPrice(p.price, p.currencyCode)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:w-56">
            <p className="text-sm text-muted-foreground">Bundle total</p>
            <p className="text-2xl font-extrabold text-primary">
              {formatPrice(bundleTotal, product.currencyCode)}
            </p>
            <button
              className="mt-3 w-full rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
            >
              Add all to cart
            </button>
          </div>
        </div>
      </section>

      {/* You may also like */}
      <section className="mt-16">
        <h2 className="text-2xl sm:text-3xl">You May Also Like</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {fallbackProducts
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
