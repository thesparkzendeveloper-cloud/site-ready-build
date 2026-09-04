import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Star, ShoppingCart, Truck, ShieldCheck, Plus, Minus, AlertCircle, RotateCcw } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Crumbs } from "@/components/site/Crumbs";
import { ProductCard } from "@/components/site/ProductCard";
import {
  getProduct,
  getProductAsync,
  getProductsAsync,
  products as fallbackProducts,
  formatPrice,
  getColorCode,
  type Product,
} from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const [product, allProducts] = await Promise.all([
      getProductAsync(params.slug),
      getProductsAsync(),
    ]);
    if (!product) throw notFound();
    const relatedProducts = allProducts.filter((p) => p.slug !== product.slug).slice(0, 4);
    return { product, relatedProducts };
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

function ProductPage() {
  const { product: initialProduct, relatedProducts = [] } = Route.useLoaderData() as {
    product: Product;
    relatedProducts?: Product[];
  };
  const [product, setProduct] = useState<Product>(initialProduct);
  const [image, setImage] = useState(initialProduct.gallery[0] || initialProduct.image);

  const availableSizes = (() => {
    if (product.sizes && product.sizes.length > 0) return product.sizes;
    const isAccessory =
      product.category?.toLowerCase().includes("accessories") ||
      product.category?.toLowerCase().includes("cap") ||
      product.name?.toLowerCase().includes("keychain") ||
      product.name?.toLowerCase().includes("tote");
    return isAccessory ? ["Free Size"] : defaultSizes;
  })();

  const availableColors = (() => {
    if (product.colors && product.colors.length > 0) return product.colors;
    return ["Black", "Red", "Off White"];
  })();

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || "M");
  const [selectedColor, setSelectedColor] = useState<string>(availableColors[0] || "Black");
  const [quantity, setQuantity] = useState(1);
  const [selectedOptionsState, setSelectedOptionsState] = useState<Record<string, string>>({});

  const { addToCart, checkout } = useCart();

  useEffect(() => {
    setProduct(initialProduct);
    setImage(initialProduct.gallery[0] || initialProduct.image);
    setQuantity(1);

    const initSizes = initialProduct.sizes && initialProduct.sizes.length > 0 ? initialProduct.sizes : defaultSizes;
    const initColors = initialProduct.colors && initialProduct.colors.length > 0 ? initialProduct.colors : ["Black", "Red", "Off White"];
    setSelectedSize(initSizes[0] || "M");
    setSelectedColor(initColors[0] || "Black");

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
      quantity,
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
      quantity,
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
              {product.options.map((option) => {
                const isColorOption =
                  option.name.toLowerCase() === "color" || option.name.toLowerCase() === "colour";
                return (
                  <div key={option.id}>
                    <h2 className="text-xs font-extrabold uppercase tracking-[0.16em]">
                      {option.name}:{" "}
                      <span className="text-primary">
                        {selectedOptionsState[option.name] || option.values[0]}
                      </span>
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2.5">
                      {option.values.map((val) => {
                        const isSelected = selectedOptionsState[option.name] === val;
                        if (isColorOption) {
                          const bg = getColorCode(val);
                          return (
                            <button
                              key={val}
                              onClick={() => handleOptionChange(option.name, val)}
                              aria-label={`Select color ${val}`}
                              title={val}
                              className={`flex items-center gap-2 rounded-xl px-3 py-2 border text-sm font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                                  : "border-border hover:border-primary text-foreground"
                              }`}
                            >
                              <span
                                className="h-4 w-4 rounded-full ring-1 ring-border shadow-xs shrink-0"
                                style={{ background: bg }}
                              />
                              <span>{val}</span>
                            </button>
                          );
                        }
                        return (
                          <button
                            key={val}
                            onClick={() => handleOptionChange(option.name, val)}
                            className={`min-w-11 px-3.5 py-2 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : "border-border hover:border-primary text-foreground"
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              {/* Size Selection */}
              <div className="mt-7">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-extrabold uppercase tracking-[0.16em]">
                    Select Size: <span className="text-primary">{selectedSize}</span>
                  </h2>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {availableSizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`h-11 px-4 min-w-14 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                        selectedSize === s
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border hover:border-primary text-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colour Selection */}
              {availableColors.length > 0 && availableColors[0] !== "Default" && (
                <div className="mt-6">
                  <h2 className="text-xs font-extrabold uppercase tracking-[0.16em]">
                    Colour: <span className="text-primary">{selectedColor}</span>
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {availableColors.map((name) => {
                      const bg = getColorCode(name);
                      return (
                        <button
                          key={name}
                          onClick={() => setSelectedColor(name)}
                          aria-label={name}
                          title={name}
                          className={`flex items-center gap-2 rounded-xl px-3 py-2 border text-sm font-bold transition-all cursor-pointer ${
                            selectedColor === name
                              ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary shadow-xs"
                              : "border-border hover:border-primary text-foreground"
                          }`}
                        >
                          <span
                            className="h-4 w-4 rounded-full ring-1 ring-border shadow-xs shrink-0"
                            style={{ background: bg }}
                          />
                          <span>{name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Product Count / Quantity Selector */}
          <div className="mt-6">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.16em]">Quantity</h2>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center rounded-xl border border-border bg-surface p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-muted disabled:opacity-40 transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-extrabold text-foreground">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-xs text-muted-foreground font-semibold">
                {quantity > 1 ? `${quantity} items selected` : "1 item selected"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
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
              [ShieldCheck, "100% authentic streetwear"],
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

          {/* Product Details */}
          <div className="surface-card mt-7 rounded-2xl p-5 border border-border/80">
            <h2 className="text-sm font-extrabold">Product Details</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>· Premium heavyweight fabric, 320 GSM</li>
              <li>· Oversized relaxed fit with drop shoulders</li>
              <li>· Reflective screen print, crack-resistant</li>
              <li>· Ribbed cuffs and hem with kangaroo pocket</li>
              <li>· Machine wash cold, inside out</li>
            </ul>
          </div>

          {/* Shipping & Return Policy Section */}
          <div className="surface-card mt-6 rounded-2xl p-5 border border-border/80 space-y-4">
            <h2 className="text-sm font-extrabold text-foreground flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" /> Shipping & Return Policy
            </h2>

            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary shrink-0 mt-0.5">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">Fast Dispatch & Shipping</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                    Orders are processed and dispatched within 24-48 hours. Express delivery across India takes 3-5 business days. Free shipping on all orders above ₹999.
                  </p>
                </div>
              </div>

              <div className="border-t border-border/60 pt-3 flex items-start gap-3">
                <div className="rounded-xl bg-destructive/10 p-2 text-destructive shrink-0 mt-0.5">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-foreground">Return Policy</h3>
                    <span className="rounded bg-destructive/10 px-2 py-0.5 text-[10px] font-extrabold text-destructive">
                      No Returns Available
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">No returns available</strong> for this product. Replacement or size exchange is permitted within 7 days of delivery only in case of sizing issues or damaged/defective products received.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* You May Also Like */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl sm:text-3xl">You May Also Like</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
