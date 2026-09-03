import heroHoodie from "@/assets/hero-hoodie.jpg";

import {
  fetchShopifyProducts,
  fetchShopifyProductByHandle,
  fetchShopifyCollections,
  type ShopifyProduct,
  type ShopifyCollection,
  type ShopifyVariant,
  type ShopifyProductOption,
} from "./shopify";

export type ProductVariant = {
  id: string;
  title: string;
  price: number;
  compareAt?: number | undefined;
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
  image?: string | undefined;
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type Product = {
  id?: string | undefined;
  variantId?: string | undefined;
  slug: string;
  name: string;
  subtitle: string;
  price: number;
  compareAt?: number | undefined;
  image: string;
  gallery: string[];
  category: string;
  productType?: string | undefined;
  collections?: Array<{ title: string; handle: string }> | undefined;
  tags?: string[] | undefined;
  badge?: string | undefined;
  rating: number;
  reviews: number;
  description: string;
  availableForSale?: boolean | undefined;
  currencyCode?: string | undefined;
  options?: ProductOption[] | undefined;
  variants?: ProductVariant[] | undefined;
  sizes?: string[] | undefined;
  colors?: string[] | undefined;
  material?: string | undefined;
};

export const COLOR_MAP: Record<string, string> = {
  black: "oklch(0.16 0.008 40)",
  red: "oklch(0.53 0.216 27.5)",
  "off white": "oklch(0.95 0.01 85)",
  white: "oklch(0.98 0.002 90)",
  grey: "oklch(0.72 0.008 70)",
  gray: "oklch(0.72 0.008 70)",
  beige: "oklch(0.88 0.03 85)",
  navy: "oklch(0.3 0.1 250)",
  blue: "oklch(0.45 0.15 240)",
  green: "oklch(0.4 0.1 140)",
  olive: "oklch(0.4 0.1 140)",
  charcoal: "oklch(0.25 0.005 50)",
  brown: "oklch(0.35 0.08 60)",
  maroon: "oklch(0.4 0.18 25)",
  yellow: "oklch(0.85 0.18 90)",
  orange: "oklch(0.65 0.2 45)",
  purple: "oklch(0.5 0.22 300)",
  pink: "oklch(0.75 0.15 350)",
};

export function getColorCode(colorName: string): string {
  if (!colorName) return "oklch(0.16 0.008 40)";
  const normalized = colorName.toLowerCase().trim();
  return COLOR_MAP[normalized] || "oklch(0.25 0.005 50)";
}

// Optimized for live Shopify products catalog
export const products: Product[] = [];

export const categories: Array<{ name: string; count: number }> = [
  { name: "All Products", count: 0 },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const formatPrice = (value: number, currencyCode: string = "INR") => {
  if (currencyCode === "INR") {
    return `₹${value.toLocaleString("en-IN")}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(value);
};

export function mapShopifyProductToProduct(sp: ShopifyProduct): Product {
  const price = Math.round(parseFloat(sp.priceRange.minVariantPrice.amount));
  const compareAt = sp.compareAtPriceRange?.minVariantPrice?.amount
    ? Math.round(parseFloat(sp.compareAtPriceRange.minVariantPrice.amount))
    : undefined;

  const images = sp.images?.nodes ? sp.images.nodes.map((img) => img.url) : [];
  const featuredImg = sp.featuredImage?.url || images[0] || heroHoodie;
  const gallery = images.length > 0 ? images : [featuredImg].filter(Boolean);

  const firstVariant = sp.variants?.nodes?.[0];
  const nonHomeCollection = sp.collections?.nodes?.find((c) => c.title !== "Home page")?.title;
  let primaryCollection = sp.productType || nonHomeCollection;

  if (!primaryCollection || primaryCollection === "Home page" || primaryCollection === "Streetwear") {
    const titleLower = sp.title.toLowerCase();
    if (titleLower.includes("hoodie")) primaryCollection = "Hoodies";
    else if (titleLower.includes("oversized") || titleLower.includes("tee")) primaryCollection = "Oversized Tees";
    else if (titleLower.includes("t-shirt") || titleLower.includes("shirt")) primaryCollection = "T-Shirts";
    else if (titleLower.includes("sweatshirt")) primaryCollection = "Sweatshirts";
    else if (titleLower.includes("sleeve")) primaryCollection = "Long Sleeves";
    else if (titleLower.includes("cap") || titleLower.includes("tote") || titleLower.includes("keychain") || titleLower.includes("accessory")) primaryCollection = "Accessories";
    else primaryCollection = "Streetwear";
  }

  // Extract sizes from Shopify options or variants
  const sizeOption = sp.options?.find((opt) => opt.name.toLowerCase() === "size");
  const extractedSizes = sizeOption?.values && sizeOption.values.length > 0
    ? sizeOption.values
    : Array.from(
        new Set(
          sp.variants?.nodes
            ?.map((v) => v.selectedOptions?.find((opt) => opt.name.toLowerCase() === "size")?.value)
            .filter(Boolean) as string[]
        )
      );

  // Extract colors from Shopify options or variants
  const colorOption = sp.options?.find(
    (opt) => opt.name.toLowerCase() === "color" || opt.name.toLowerCase() === "colour"
  );
  const extractedColors = colorOption?.values && colorOption.values.length > 0
    ? colorOption.values
    : Array.from(
        new Set(
          sp.variants?.nodes
            ?.map((v) =>
              v.selectedOptions?.find(
                (opt) => opt.name.toLowerCase() === "color" || opt.name.toLowerCase() === "colour"
              )?.value
            )
            .filter(Boolean) as string[]
        )
      );

  return {
    id: sp.id,
    variantId: firstVariant?.id,
    slug: sp.handle,
    name: sp.title,
    subtitle: primaryCollection,
    price,
    compareAt: compareAt && compareAt > price ? compareAt : undefined,
    image: featuredImg,
    gallery,
    category: primaryCollection,
    productType: sp.productType,
    collections: sp.collections?.nodes || [],
    tags: sp.tags || [],
    rating: 4.9,
    reviews: 128,
    description: sp.description || "Premium streetwear piece by SparkZen.",
    availableForSale: sp.availableForSale,
    currencyCode: sp.priceRange?.minVariantPrice?.currencyCode || "INR",
    sizes: extractedSizes.length > 0 ? extractedSizes : undefined,
    colors: extractedColors.length > 0 ? extractedColors : undefined,
    options: sp.options?.map((opt) => ({
      id: opt.id,
      name: opt.name,
      values: opt.values,
    })),
    variants: sp.variants?.nodes?.map((v) => ({
      id: v.id,
      title: v.title,
      price: Math.round(parseFloat(v.price.amount)),
      compareAt: v.compareAtPrice ? Math.round(parseFloat(v.compareAtPrice.amount)) : undefined,
      availableForSale: v.availableForSale,
      selectedOptions: v.selectedOptions,
      image: v.image?.url,
    })),
  };
}

export async function getProductsAsync(): Promise<Product[]> {
  try {
    const shopifyProducts = await fetchShopifyProducts();
    if (shopifyProducts && shopifyProducts.length > 0) {
      return shopifyProducts.map(mapShopifyProductToProduct);
    }
  } catch (e) {
    console.warn("Shopify products fetch failed:", e);
  }
  return [];
}

export async function getProductAsync(slug: string): Promise<Product | undefined> {
  try {
    const sp = await fetchShopifyProductByHandle(slug);
    if (sp) {
      return mapShopifyProductToProduct(sp);
    }
  } catch (e) {
    console.warn("Shopify single product fetch failed:", e);
  }
  return undefined;
}

export async function getCategoriesAsync(): Promise<Array<{ name: string; count: number }>> {
  try {
    const [cols, shopifyProducts] = await Promise.all([
      fetchShopifyCollections(),
      fetchShopifyProducts(),
    ]);

    const mappedProducts = (shopifyProducts || []).map(mapShopifyProductToProduct);
    const categoryCounts: Map<string, number> = new Map();

    // Standard baseline categories
    const standardCategories = [
      "Hoodies",
      "Oversized Tees",
      "T-Shirts",
      "Sweatshirts",
      "Long Sleeves",
      "Accessories",
    ];

    for (const cat of standardCategories) {
      categoryCounts.set(cat, 0);
    }

    // Include custom Shopify Collections
    if (cols && cols.length > 0) {
      for (const col of cols) {
        if (col.title && col.title !== "Home page") {
          if (!categoryCounts.has(col.title)) {
            categoryCounts.set(col.title, 0);
          }
        }
      }
    }

    // Count matching products for each category
    for (const p of mappedProducts) {
      let matchedAny = false;
      if (p.category && categoryCounts.has(p.category)) {
        categoryCounts.set(p.category, (categoryCounts.get(p.category) || 0) + 1);
        matchedAny = true;
      }

      if (p.collections && p.collections.length > 0) {
        for (const c of p.collections) {
          if (c.title !== "Home page" && categoryCounts.has(c.title)) {
            if (c.title !== p.category) {
              categoryCounts.set(c.title, (categoryCounts.get(c.title) || 0) + 1);
            }
            matchedAny = true;
          }
        }
      }

      if (!matchedAny && p.category && p.category !== "Home page" && p.category !== "Streetwear") {
        categoryCounts.set(p.category, (categoryCounts.get(p.category) || 0) + 1);
      }
    }

    const categoriesResult = [
      { name: "All Products", count: mappedProducts.length },
      ...Array.from(categoryCounts.entries()).map(([name, count]) => ({ name, count })),
    ];

    return categoriesResult;
  } catch (e) {
    console.warn("Shopify categories fetch failed:", e);
    return [{ name: "All Products", count: 0 }];
  }
}
