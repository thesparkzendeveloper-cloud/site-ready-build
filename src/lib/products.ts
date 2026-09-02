import akImg from "@/assets/products/AK.jpeg";
import ajithImg from "@/assets/products/Ajith.jpeg";
import bmwLogoImg from "@/assets/products/BMW logo.jpeg";
import bmwCarImg from "@/assets/products/Bmw car.jpeg";
import gtaImg from "@/assets/products/GTA.jpeg";
import raavanImg from "@/assets/products/Raavan.jpeg";
import spiderManImg from "@/assets/products/Spider Man.jpeg";
import spiderImg from "@/assets/products/Spider.jpeg";
import spidermanImg from "@/assets/products/Spiderman.jpeg";
import ravananImg from "@/assets/products/ravanan.jpeg";

import cap from "@/assets/product-cap.jpg";
import keychain from "@/assets/product-keychain.jpg";
import tote from "@/assets/product-tote.jpg";
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

export const products: Product[] = [
  {
    slug: "spider-man-webbed-hoodie",
    name: "Spider-Man Webbed Hoodie",
    subtitle: "Streetwear Essential",
    price: 1499,
    compareAt: 1999,
    image: spiderManImg,
    gallery: [spiderManImg, spiderImg, spidermanImg],
    category: "Hoodies",
    badge: "Best Seller",
    rating: 4.9,
    reviews: 1420,
    description:
      "Built for those who don't blend in. Our Spider-Man Webbed Hoodie features high-density artwork on 360 GSM fleece. Premium comfort, oversized fit, and made to stand out.",
  },
  {
    slug: "ak-edition-oversized-tee",
    name: "AK Edition Oversized Tee",
    subtitle: "Streetwear Essential",
    price: 899,
    compareAt: 1199,
    image: akImg,
    gallery: [akImg, ajithImg],
    category: "Oversized Tees",
    badge: "Trending",
    rating: 4.8,
    reviews: 980,
    description:
      "Drop-shoulder oversized tee featuring bold AK typographic art. 240 GSM combed cotton that keeps its structured shape wash after wash.",
  },
  {
    slug: "bmw-motorsport-hoodie",
    name: "BMW Motorsport Hoodie",
    subtitle: "Streetwear Essential",
    price: 1599,
    compareAt: 2199,
    image: bmwLogoImg,
    gallery: [bmwLogoImg, bmwCarImg],
    category: "Hoodies",
    badge: "Limited Drop",
    rating: 4.9,
    reviews: 2150,
    description:
      "Motorsport-inspired heavyweight streetwear hoodie with the iconic badge emblem. Deep kangaroo pocket and custom drawstring detail.",
  },
  {
    slug: "raavan-mythic-hoodie",
    name: "Raavan Mythic Hoodie",
    subtitle: "Streetwear Essential",
    price: 1399,
    compareAt: 1799,
    image: raavanImg,
    gallery: [raavanImg, ravananImg],
    category: "Hoodies",
    badge: "Hot Drop",
    rating: 4.8,
    reviews: 860,
    description:
      "A dark art mythical statement piece. Heavyweight fleece, relaxed shoulders, and rich contrast print built to make an impression.",
  },
  {
    slug: "gta-graphic-oversized-tee",
    name: "GTA Graphic Oversized Tee",
    subtitle: "Streetwear Essential",
    price: 899,
    compareAt: 1299,
    image: gtaImg,
    gallery: [gtaImg, akImg],
    category: "Oversized Tees",
    badge: "Viral",
    rating: 4.7,
    reviews: 1120,
    description:
      "Nostalgic retro streetwear tee with high-definition vibrant print. 240 GSM breathable combed cotton with reinforced ribbing.",
  },
  {
    slug: "m-power-track-sweatshirt",
    name: "M-Power Track Sweatshirt",
    subtitle: "Streetwear Essential",
    price: 1299,
    compareAt: 1699,
    image: bmwCarImg,
    gallery: [bmwCarImg, bmwLogoImg],
    category: "Sweatshirts",
    rating: 4.7,
    reviews: 640,
    description:
      "Clean structured graphic sweatshirt featuring supercar artwork. French terry inside, structured outside for everyday layering.",
  },
  {
    slug: "ajith-tribute-graphic-tee",
    name: "Ajith Tribute Graphic Tee",
    subtitle: "Streetwear Essential",
    price: 799,
    compareAt: 999,
    image: ajithImg,
    gallery: [ajithImg, akImg],
    category: "T-Shirts",
    rating: 4.8,
    reviews: 750,
    description:
      "Cinematic monochrome graphic print on pure organic cotton. Minimal on the collar, bold on the graphic.",
  },
  {
    slug: "heroic-spider-oversized-tee",
    name: "Heroic Spider Oversized Tee",
    subtitle: "Streetwear Essential",
    price: 899,
    compareAt: 1199,
    image: spidermanImg,
    gallery: [spidermanImg, spiderManImg, spiderImg],
    category: "Oversized Tees",
    badge: "New",
    rating: 4.8,
    reviews: 530,
    description:
      "Dynamic action graphic oversized tee with crack-resistant ink. Dropped shoulders for an effortless streetwear drape.",
  },
  {
    slug: "king-ravana-sweatshirt",
    name: "King Ravana Edition Sweatshirt",
    subtitle: "Streetwear Essential",
    price: 1199,
    compareAt: 1599,
    image: ravananImg,
    gallery: [ravananImg, raavanImg],
    category: "Sweatshirts",
    rating: 4.6,
    reviews: 410,
    description:
      "Gothic mythical art on a deep black fleece sweatshirt. Premium construction with double-stitched seams.",
  },
  {
    slug: "arachnid-long-sleeve",
    name: "Arachnid Graphic Long Sleeve",
    subtitle: "Streetwear Essential",
    price: 999,
    compareAt: 1399,
    image: spiderImg,
    gallery: [spiderImg, spiderManImg, spidermanImg],
    category: "Long Sleeves",
    rating: 4.7,
    reviews: 320,
    description:
      "Dark red long sleeve tee with intricate arachnid chest print. Layer it or wear it solo.",
  },
  {
    slug: "spark-zen-cap",
    name: "Spark Zen Cap",
    subtitle: "Accessory",
    price: 499,
    image: cap,
    gallery: [cap],
    category: "Accessories",
    rating: 4.4,
    reviews: 210,
    description:
      "Six-panel cotton twill cap with an embroidered spark patch and adjustable strap.",
  },
  {
    slug: "spark-zen-keychain",
    name: "Spark Zen Keychain",
    subtitle: "Accessory",
    price: 299,
    image: keychain,
    gallery: [keychain],
    category: "Accessories",
    rating: 4.5,
    reviews: 160,
    description:
      "Enamel-on-metal dog tag keychain. Small piece of the movement for your pocket.",
  },
  {
    slug: "spark-zen-tote",
    name: "Spark Zen Tote Bag",
    subtitle: "Accessory",
    price: 399,
    image: tote,
    gallery: [tote],
    category: "Accessories",
    rating: 4.5,
    reviews: 145,
    description:
      "Heavy canvas tote with the signature branch print. Carries everything, matches everything.",
  },
];

export const categories = [
  { name: "All Products", count: products.length },
  { name: "Hoodies", count: 3 },
  { name: "Oversized Tees", count: 3 },
  { name: "T-Shirts", count: 1 },
  { name: "Sweatshirts", count: 2 },
  { name: "Long Sleeves", count: 1 },
  { name: "Accessories", count: 3 },
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

  const images = sp.images.nodes.map((img) => img.url);
  const featuredImg = sp.featuredImage?.url || images[0] || heroHoodie;
  const gallery = images.length > 0 ? images : [featuredImg];

  const firstVariant = sp.variants.nodes[0];
  const nonHomeCollection = sp.collections.nodes.find((c) => c.title !== "Home page")?.title;
  let primaryCollection = sp.productType || nonHomeCollection;

  if (!primaryCollection || primaryCollection === "Home page" || primaryCollection === "Streetwear") {
    const titleLower = sp.title.toLowerCase();
    if (titleLower.includes("hoodie")) primaryCollection = "Hoodies";
    else if (titleLower.includes("oversized") || titleLower.includes("tee")) primaryCollection = "Oversized Tees";
    else if (titleLower.includes("t-shirt")) primaryCollection = "T-Shirts";
    else if (titleLower.includes("sweatshirt")) primaryCollection = "Sweatshirts";
    else if (titleLower.includes("sleeve")) primaryCollection = "Long Sleeves";
    else if (titleLower.includes("cap") || titleLower.includes("tote") || titleLower.includes("keychain")) primaryCollection = "Accessories";
    else primaryCollection = "Hoodies";
  }

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
    rating: 4.8,
    reviews: 120,
    description: sp.description || "Premium streetwear piece by SparkZen.",
    availableForSale: sp.availableForSale,
    currencyCode: sp.priceRange.minVariantPrice.currencyCode || "INR",
    options: sp.options.map((opt) => ({
      id: opt.id,
      name: opt.name,
      values: opt.values,
    })),
    variants: sp.variants.nodes.map((v) => ({
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
      const mapped = shopifyProducts.map(mapShopifyProductToProduct);
      const mappedSlugs = new Set(mapped.map((p) => p.slug));
      const merged = [...mapped, ...products.filter((p) => !mappedSlugs.has(p.slug))];
      return merged;
    }
  } catch (e) {
    console.warn("Shopify fetch failed, using local products catalog", e);
  }
  return products;
}

export async function getProductAsync(slug: string): Promise<Product | undefined> {
  try {
    const sp = await fetchShopifyProductByHandle(slug);
    if (sp) {
      return mapShopifyProductToProduct(sp);
    }
  } catch (e) {
    console.warn("Shopify single product fetch failed", e);
  }
  return getProduct(slug);
}

export async function getCategoriesAsync(): Promise<Array<{ name: string; count: number }>> {
  let mappedProducts: Product[] = products;
  let shopifyCollections: ShopifyCollection[] = [];

  try {
    const [cols, shopifyProducts] = await Promise.all([
      fetchShopifyCollections(),
      fetchShopifyProducts(),
    ]);
    shopifyCollections = cols;
    if (shopifyProducts && shopifyProducts.length > 0) {
      const mapped = shopifyProducts.map(mapShopifyProductToProduct);
      const mappedSlugs = new Set(mapped.map((p) => p.slug));
      mappedProducts = [...mapped, ...products.filter((p) => !mappedSlugs.has(p.slug))];
    }
  } catch {
    mappedProducts = products;
  }

  const defaultCategoryNames = [
    "Hoodies",
    "Oversized Tees",
    "T-Shirts",
    "Sweatshirts",
    "Long Sleeves",
    "Accessories",
  ];

  const categoryCounts: Record<string, number> = {};
  for (const cat of defaultCategoryNames) {
    categoryCounts[cat] = 0;
  }

  for (const p of mappedProducts) {
    if (p.category && p.category !== "Home page") {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    }
  }

  for (const col of shopifyCollections) {
    if (col.title !== "Home page" && categoryCounts[col.title] === undefined) {
      categoryCounts[col.title] = 0;
    }
  }

  const result = [
    { name: "All Products", count: mappedProducts.length },
    ...Object.entries(categoryCounts).map(([name, count]) => ({ name, count })),
  ];

  return result;
}
