import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Star } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { TrustBar } from "@/components/site/TrustBar";
import { products, formatPrice } from "@/lib/products";
import heroHoodie from "@/assets/hero-hoodie.jpg";
import dropBanner from "@/assets/drop-banner.jpg";
import graphicHoodie from "@/assets/product-graphic-hoodie.jpg";
import oversizedTee from "@/assets/product-oversized-tee.jpg";
import sweatshirt from "@/assets/product-sweatshirt.jpg";
import cap from "@/assets/product-cap.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SparkZen Clothing — Define Your Style, Own Your World" },
      {
        name: "description",
        content:
          "Premium streetwear hoodies, oversized tees and accessories from SparkZen Clothing. Limited drops, bold graphics, built to stand out.",
      },
      { property: "og:title", content: "SparkZen Clothing — Define Your Style, Own Your World" },
      {
        property: "og:description",
        content: "Premium streetwear hoodies, oversized tees and accessories. Limited drops.",
      },
    ],
  }),
  component: Home,
});

const categoryCards = [
  { name: "Hoodies", image: graphicHoodie },
  { name: "Oversized Tees", image: oversizedTee },
  { name: "Sweatshirts", image: sweatshirt },
  { name: "Accessories", image: cap },
];

function Home() {
  const featured = products[0]!;

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="panel-ink relative overflow-hidden rounded-3xl">
        <div className="grid items-center gap-8 px-6 py-12 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div>
            <p className="eyebrow">New Season · Drop 04</p>
            <h1 className="mt-4 text-4xl leading-[1.02] text-ink-foreground sm:text-5xl lg:text-6xl">
              Define Your Style,
              <br />
              <span className="text-primary">Own Your World.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-muted sm:text-base">
              Premium streetwear built for people who refuse to blend in. Limited pieces, heavy
              fabrics, graphics that speak before you do.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.03]"
                style={{ boxShadow: "var(--shadow-glow)" }}
              >
                Shop the Drop <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center rounded-full border border-ink-foreground/25 px-6 py-3 text-sm font-bold text-ink-foreground transition-colors hover:border-primary hover:text-primary"
              >
                Our Story
              </Link>
            </div>
            <div className="mt-10 flex gap-8 text-ink-foreground">
              {[
                ["25K+", "Happy customers"],
                ["4.8★", "Average rating"],
                ["48H", "Fast dispatch"],
              ].map(([big, small]) => (
                <div key={big}>
                  <p className="text-xl font-extrabold">{big}</p>
                  <p className="text-xs text-ink-muted">{small}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-full bg-primary/25 blur-3xl" />
            <img
              src={heroHoodie}
              alt="SparkZen signature graphic hoodie"
              className="relative aspect-square w-full rounded-2xl object-cover"
            />
          </div>
        </div>
      </section>

      {/* Featured look */}
      <section className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="surface-card flex flex-col gap-6 rounded-2xl p-6 sm:flex-row sm:items-center">
          <img
            src={featured.image}
            alt={featured.name}
            className="h-56 w-full rounded-xl object-cover sm:w-48"
          />
          <div>
            <p className="eyebrow">Featured Look</p>
            <h2 className="mt-2 text-2xl">{featured.name}</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">{featured.description}</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xl font-extrabold text-primary">
                {formatPrice(featured.price)}
              </span>
              {featured.compareAt && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(featured.compareAt)}
                </span>
              )}
            </div>
            <Link
              to="/product/$slug"
              params={{ slug: featured.slug }}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-ink-foreground hover:bg-primary"
            >
              View Product <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <TrustBar variant="red" />
      </section>

      {/* Categories */}
      <section className="mt-14">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Browse</p>
            <h2 className="mt-2 text-2xl sm:text-3xl">Shop by Category</h2>
          </div>
          <Link to="/shop" className="text-sm font-bold text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categoryCards.map((cat) => (
            <Link
              key={cat.name}
              to="/shop"
              className="group relative overflow-hidden rounded-2xl"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="aspect-4/5 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
                <span className="text-base font-extrabold text-ink-foreground">{cat.name}</span>
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Drop banner */}
      <section className="relative mt-14 overflow-hidden rounded-3xl">
        <img src={dropBanner} alt="New drop" className="h-72 w-full object-cover sm:h-80" />
        <div className="absolute inset-0 flex flex-col justify-center gap-4 bg-ink/70 p-8 sm:p-14">
          <p className="eyebrow">New Drop Alert</p>
          <h2 className="max-w-lg text-3xl text-ink-foreground sm:text-4xl">
            Winter Capsule is live. 200 pieces only.
          </h2>
          <div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
            >
              Grab Yours <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Top picks */}
      <section className="mt-14">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Bestsellers</p>
            <h2 className="mt-2 text-2xl sm:text-3xl">Our Top Picks</h2>
          </div>
          <Link to="/shop" className="text-sm font-bold text-primary hover:underline">
            Shop all
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="mt-14 grid gap-4 sm:grid-cols-3">
        {[
          ["Aditya R.", "The hoodie fabric is unreal. Fits exactly like the pictures."],
          ["Sneha M.", "Ordered two tees, both shipped in 2 days. Print quality is top."],
          ["Karthik V.", "Finally an Indian brand doing real streetwear. Repeat customer."],
        ].map(([name, text]) => (
          <blockquote key={name} className="surface-card rounded-2xl p-6">
            <div className="flex gap-0.5 text-primary">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">"{text}"</p>
            <footer className="mt-4 text-sm font-bold">{name}</footer>
          </blockquote>
        ))}
      </section>
    </SiteLayout>
  );
}
