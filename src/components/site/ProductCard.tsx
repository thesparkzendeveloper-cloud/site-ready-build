import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart } from "lucide-react";
import { formatPrice, type Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

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
    });
  };

  return (
    <article className="surface-card group overflow-hidden rounded-2xl">
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
          <span className="hidden lg:block absolute left-3 top-3 rounded-md bg-ink px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-ink-foreground">
            {product.badge}
          </span>
        )}
        <button
          aria-label="Add to wishlist"
          className="hidden lg:grid absolute right-3 top-3 h-8 w-8 place-items-center rounded-full bg-surface/90 text-foreground shadow-sm transition-colors hover:text-primary cursor-pointer"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      {/* Desktop Product Details - Hidden on Mobile View */}
      <div className="hidden p-4 lg:block">
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="text-sm font-bold hover:text-primary"
        >
          {product.name}
        </Link>
        <p className="mt-0.5 text-xs text-muted-foreground">{product.subtitle}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-base font-extrabold text-primary">
            {formatPrice(product.price, product.currencyCode)}
          </span>
          <button
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
            className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 cursor-pointer"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}



