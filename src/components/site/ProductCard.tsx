import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, ShoppingCart, Check } from "lucide-react";
import { formatPrice, getColorCode, type Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  // Extract available sizes from Shopify options, variants, or product sizes
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
      product.name?.toLowerCase().includes("keychain") ||
      product.name?.toLowerCase().includes("tote");
    return isAccessory ? ["Free Size"] : ["S", "M", "L", "XL", "XXL"];
  })();

  // Extract available colors from Shopify options, variants, or product colors
  const availableColors = (() => {
    if (product.colors && product.colors.length > 0) return product.colors;
    const colorOption = product.options?.find(
      (opt) => opt.name.toLowerCase() === "color" || opt.name.toLowerCase() === "colour"
    );
    if (colorOption && colorOption.values.length > 0) return colorOption.values;
    if (product.variants && product.variants.length > 0) {
      const vColors = product.variants
        .map((v) =>
          v.selectedOptions?.find(
            (opt) => opt.name.toLowerCase() === "color" || opt.name.toLowerCase() === "colour"
          )?.value
        )
        .filter(Boolean) as string[];
      if (vColors.length > 0) return Array.from(new Set(vColors));
    }
    const isAccessory =
      product.category?.toLowerCase().includes("accessories") ||
      product.name?.toLowerCase().includes("keychain");
    return isAccessory ? ["Default"] : ["Black", "Red", "Off White"];
  })();

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || "M");
  const [selectedColor, setSelectedColor] = useState<string>(availableColors[0] || "Black");

  // Find matching variant based on currently selected size and color
  const matchingVariant = product.variants?.find((v) => {
    if (!v.selectedOptions || v.selectedOptions.length === 0) return false;
    const sizeMatch = v.selectedOptions.some(
      (opt) => opt.name.toLowerCase() === "size" && opt.value === selectedSize
    );
    const colorMatch = v.selectedOptions.some(
      (opt) =>
        (opt.name.toLowerCase() === "color" || opt.name.toLowerCase() === "colour") &&
        opt.value.toLowerCase() === selectedColor.toLowerCase()
    );
    return sizeMatch && (availableColors[0] === "Default" || colorMatch);
  }) || product.variants?.[0];

  const currentPrice = matchingVariant?.price || product.price;
  const currentCompareAt = matchingVariant?.compareAt || product.compareAt;
  const currentImage = matchingVariant?.image || product.image;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const variantId =
      matchingVariant?.id ||
      product.variantId ||
      product.variants?.[0]?.id ||
      `variant-${product.slug}`;

    const options = [{ name: "Size", value: selectedSize }];
    if (availableColors.length > 0 && availableColors[0] !== "Default") {
      options.push({ name: "Color", value: selectedColor });
    }

    addToCart({
      variantId,
      quantity: 1,
      title: product.name,
      handle: product.slug,
      price: currentPrice,
      image: currentImage || product.image,
      selectedOptions: options,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleSelectSize = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSize(size);
  };

  const handleSelectColor = (e: React.MouseEvent, color: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedColor(color);
  };

  return (
    <article className="surface-card group flex flex-col overflow-hidden rounded-2xl border border-border/70 transition-all duration-300 hover:shadow-xl hover:border-primary/40 bg-surface">
      {/* Product Image Box */}
      <div className="relative aspect-4/5 overflow-hidden bg-muted">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="block h-full w-full">
          <img
            src={currentImage || product.image}
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

      {/* Product Information Card Area */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-4.5 space-y-3">
        <div>
          {/* Category Tag */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary">
              {product.category || product.subtitle || "Streetwear"}
            </span>
            {currentCompareAt && currentCompareAt > currentPrice && (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-extrabold text-primary">
                {Math.round((1 - currentPrice / currentCompareAt) * 100)}% OFF
              </span>
            )}
          </div>

          {/* Product Title */}
          <Link
            to="/product/$slug"
            params={{ slug: product.slug }}
            className="mt-1 block line-clamp-1 text-sm sm:text-base font-bold text-foreground hover:text-primary transition-colors"
          >
            {product.name}
          </Link>

          {/* Product Description */}
          {product.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Size Variants Badges / Selector */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mr-0.5">
              Size:
            </span>
            {availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={(e) => handleSelectSize(e, size)}
                className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                  selectedSize === size
                    ? "bg-primary text-primary-foreground shadow-xs font-extrabold scale-105"
                    : "bg-muted text-foreground/80 hover:bg-muted/80 hover:text-foreground border border-border/40"
                }`}
                aria-label={`Select size ${size}`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Colour Variants Swatches / Selector */}
          {availableColors.length > 0 && availableColors[0] !== "Default" && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mr-0.5">
                Color:
              </span>
              <div className="flex items-center gap-1.5">
                {availableColors.map((color) => {
                  const isSelected = selectedColor === color;
                  const bg = getColorCode(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={(e) => handleSelectColor(e, color)}
                      aria-label={`Select color ${color}`}
                      title={color}
                      className={`h-4.5 w-4.5 rounded-full ring-2 transition-all cursor-pointer ${
                        isSelected
                          ? "ring-primary scale-110 shadow-xs"
                          : "ring-border/60 hover:ring-primary/60 hover:scale-105"
                      }`}
                      style={{ background: bg }}
                    />
                  );
                })}
              </div>
              <span className="text-[10px] font-bold text-foreground/80 ml-0.5">
                {selectedColor}
              </span>
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-extrabold text-primary">
                {formatPrice(currentPrice, product.currencyCode)}
              </span>
              {currentCompareAt && currentCompareAt > currentPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(currentCompareAt, product.currencyCode)}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} (${selectedSize}, ${selectedColor}) to cart`}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
          >
            {added ? <Check className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
            <span>{added ? "Added" : "Add to Cart"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}



