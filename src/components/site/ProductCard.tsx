import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, ShoppingCart, Check } from "lucide-react";
import { formatPrice, type Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  // Extract available sizes from product
  const availableSizes = (() => {
    if (product.sizes && product.sizes.length > 0) return product.sizes;
    const sizeOption = product.options?.find((opt) => opt.name.toLowerCase() === "size");
    if (sizeOption && sizeOption.values.length > 0) return sizeOption.values;
    if (product.variants && product.variants.length > 0) {
      const vSizes = product.variants
        .map((v) => v.selectedOptions?.find((opt) => opt.name.toLowerCase() === "size")?.value)
        .filter(Boolean) as string[];
      if (vSizes.length > 0) return Array.from(new Set(vSizes));
    }
    const isAccessory =
      product.category?.toLowerCase().includes("accessories") ||
      product.category?.toLowerCase().includes("cap") ||
      product.name.toLowerCase().includes("keychain") ||
      product.name.toLowerCase().includes("tote");
    return isAccessory ? ["Free Size"] : ["S", "M", "L", "XL", "XXL"];
  })();

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || "M");

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const variantId = product.variantId || product.variants?.[0]?.id || `variant-${product.slug}`;
    addToCart({
      variantId,
      quantity: 1,
      title: product.name,
      handle: product.slug,
      price: product.price,
      image: product.image,
      selectedOptions: [{ name: "Size", value: selectedSize }],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleSelectSize = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSize(size);
  };

  return (
    <article className="surface-card group flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-lg hover:border-primary/40">
      <div className="relative aspect-4/5 overflow-hidden bg-muted">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="block h-full w-full">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        {product.badge && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-ink/90 backdrop-blur-xs px-2 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wider text-ink-foreground border border-border/40 shadow-xs">
            {product.badge}
          </span>
        )}
        <button
          type="button"
          aria-label="Add to wishlist"
          className="absolute right-2.5 top-2.5 grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full bg-surface/90 text-foreground shadow-sm transition-colors hover:text-primary cursor-pointer"
        >
          <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </div>

      {/* Product Details - Visible on all screen sizes */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
        <div>
          <Link
            to="/product/$slug"
            params={{ slug: product.slug }}
            className="line-clamp-1 text-sm font-bold text-foreground hover:text-primary transition-colors"
          >
            {product.name}
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">{product.subtitle}</p>

          {/* Size Variants Badges / Selector */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-0.5">
              Size:
            </span>
            {availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={(e) => handleSelectSize(e, size)}
                className={`px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                  selectedSize === size
                    ? "bg-primary text-primary-foreground shadow-xs font-extrabold scale-105"
                    : "bg-muted/80 text-foreground/80 hover:bg-muted hover:text-foreground border border-border/40"
                }`}
                aria-label={`Select size ${size}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-border/40">
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-primary">
              {formatPrice(product.price, product.currencyCode)}
            </span>
            {product.compareAt && product.compareAt > product.price && (
              <span className="text-[11px] text-muted-foreground line-through">
                {formatPrice(product.compareAt, product.currencyCode)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} (${selectedSize}) to cart`}
            className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-sm"
          >
            {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </article>
  );
}



