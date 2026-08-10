import reflectiveHoodie from "@/assets/product-reflective-hoodie.jpg";
import graphicHoodie from "@/assets/product-graphic-hoodie.jpg";
import oversizedTee from "@/assets/product-oversized-tee.jpg";
import abstractTee from "@/assets/product-abstract-tee.jpg";
import sweatshirt from "@/assets/product-sweatshirt.jpg";
import longsleeve from "@/assets/product-longsleeve.jpg";
import cap from "@/assets/product-cap.jpg";
import keychain from "@/assets/product-keychain.jpg";
import tote from "@/assets/product-tote.jpg";
import heroHoodie from "@/assets/hero-hoodie.jpg";

export type Product = {
  slug: string;
  name: string;
  subtitle: string;
  price: number;
  compareAt?: number;
  image: string;
  gallery: string[];
  category: string;
  badge?: string;
  rating: number;
  reviews: number;
  description: string;
};

export const products: Product[] = [
  {
    slug: "reflective-hoodie",
    name: "Reflective Hoodie",
    subtitle: "Streetwear Essential",
    price: 1499,
    compareAt: 1999,
    image: reflectiveHoodie,
    gallery: [reflectiveHoodie, heroHoodie, graphicHoodie, sweatshirt],
    category: "Hoodies",
    badge: "Best Seller",
    rating: 4.8,
    reviews: 2560,
    description:
      "Built for those who don't blend in. Our Reflective Hoodie features a high-quality reflective print that lights up your presence. Premium comfort, oversized fit, and made to stand out.",
  },
  {
    slug: "graphic-hoodie",
    name: "Graphic Hoodie",
    subtitle: "Streetwear Essential",
    price: 1299,
    compareAt: 1699,
    image: graphicHoodie,
    gallery: [graphicHoodie, heroHoodie, reflectiveHoodie],
    category: "Hoodies",
    rating: 4.7,
    reviews: 1180,
    description:
      "A bold red statement piece with a hand-drawn emblem. Heavyweight fleece, relaxed shoulders, built to be worn every single day.",
  },
  {
    slug: "oversized-tee",
    name: "Oversized Tee",
    subtitle: "Streetwear Essential",
    price: 899,
    image: oversizedTee,
    gallery: [oversizedTee, abstractTee],
    category: "Oversized Tees",
    rating: 4.6,
    reviews: 940,
    description:
      "Drop-shoulder oversized tee with a symmetrical back print. 240 GSM combed cotton that keeps its shape wash after wash.",
  },
  {
    slug: "abstract-tee",
    name: "Abstract Tee",
    subtitle: "Streetwear Essential",
    price: 799,
    image: abstractTee,
    gallery: [abstractTee, oversizedTee],
    category: "T-Shirts",
    rating: 4.5,
    reviews: 610,
    description:
      "Off-white canvas, one brush-stroke circle. Minimal on the outside, loud in the details.",
  },
  {
    slug: "premium-sweatshirt",
    name: "Premium Sweatshirt",
    subtitle: "Streetwear Essential",
    price: 1199,
    image: sweatshirt,
    gallery: [sweatshirt, longsleeve],
    category: "Sweatshirts",
    rating: 4.7,
    reviews: 520,
    description:
      "Clean black crewneck with a small embroidered spark. French terry inside, structured outside.",
  },
  {
    slug: "long-sleeve-tee",
    name: "Long Sleeve Tee",
    subtitle: "Streetwear Essential",
    price: 999,
    image: longsleeve,
    gallery: [longsleeve, sweatshirt],
    category: "Long Sleeves",
    rating: 4.6,
    reviews: 380,
    description:
      "Deep red long sleeve with a subtle chest mark. Layer it, or let it lead.",
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
  { name: "Hoodies", count: 12 },
  { name: "T-Shirts", count: 18 },
  { name: "Oversized Tees", count: 10 },
  { name: "Sweatshirts", count: 6 },
  { name: "Long Sleeves", count: 8 },
  { name: "Accessories", count: 4 },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const formatPrice = (value: number) => `₹${value.toLocaleString("en-IN")}`;
