import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Flame, Target, Users, Leaf, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Crumbs } from "@/components/site/Crumbs";
import { TrustBar } from "@/components/site/TrustBar";
import { ProductCard } from "@/components/site/ProductCard";
import {
  products as fallbackProducts,
  getProductsAsync,
  type Product,
} from "@/lib/products";
import heroHoodie from "@/assets/hero-hoodie.jpg";

export const Route = createFileRoute("/about")({
  loader: async () => {
    const products = await getProductsAsync();
    return { products };
  },
  head: () => ({
    meta: [
      { title: "About SparkZen — From a Spark to a Movement" },
      {
        name: "description",
        content:
          "SparkZen Clothing started as four friends and a sketchbook. Discover our mission, our story, and our signature streetwear pieces.",
      },
      { property: "og:title", content: "About SparkZen — From a Spark to a Movement" },
      {
        property: "og:description",
        content: "The story, mission, and signature streetwear pieces of SparkZen Clothing.",
      },
    ],
  }),
  component: About,
});

const timeline = [
  ["2023", "The Spark", "Four friends sketching graphics between college lectures."],
  ["2024", "First Drop", "50 hoodies printed. Sold out in 6 days."],
  ["2025", "Going National", "Shipping to 400+ cities with our own studio."],
  ["2026", "The Movement", "25,000+ customers wearing the spark every day."],
];

const values = [
  [Flame, "Bold by Default", "No safe designs. Every piece has an opinion."],
  [Target, "Quality First", "Heavy fabrics, real prints, tested wash after wash."],
  [Users, "Built with You", "Our community votes on drops before they exist."],
  [Leaf, "Made Responsibly", "Small batches, less waste, fair studios."],
];

function About() {
  const { products: loadedProducts } = Route.useLoaderData();
  const initialProducts =
    loadedProducts && loadedProducts.length > 0 ? loadedProducts : fallbackProducts;
  const [productList, setProductList] = useState<Product[]>(initialProducts);

  useEffect(() => {
    if (loadedProducts && loadedProducts.length > 0) {
      setProductList(loadedProducts);
    } else {
      getProductsAsync().then((list) => {
        if (list.length > 0) {
          setProductList(list);
        }
      });
    }
  }, [loadedProducts]);

  return (
    <SiteLayout>
      <Crumbs items={[{ label: "Home", to: "/" }, { label: "About Us" }]} />

      <section className="panel-ink relative mt-4 overflow-hidden rounded-3xl">
        <div className="grid items-center gap-8 px-6 py-12 sm:px-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow">About Us</p>
            <h1 className="mt-3 text-4xl leading-tight text-ink-foreground sm:text-5xl">
              We're Not Just A Brand.
              <br />
              <span className="text-primary">We're A Statement.</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-ink-muted sm:text-base">
              SparkZen started in a cramped room with four friends, one printer and far too much
              caffeine. We wanted clothing that felt like the music we played too loud — sharp,
              honest and impossible to ignore.
            </p>
          </div>
          <img
            src={heroHoodie}
            alt="SparkZen hoodie detail"
            className="aspect-square w-full rounded-2xl object-cover"
          />
        </div>
      </section>

      <section className="mt-12 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="surface-card rounded-2xl p-8">
          <p className="eyebrow">Our Mission</p>
          <h2 className="mt-3 text-2xl sm:text-3xl">Make confidence wearable.</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            We design in limited runs so what you wear stays yours. Every drop is a small batch,
            printed in our own studio, checked by hand before it ships. If it doesn't make us stop
            and look twice, it never goes on the site.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {values.map(([Icon, title, text]) => {
            const I = Icon as typeof Flame;
            return (
              <div key={title as string} className="surface-card rounded-2xl p-5">
                <I className="h-6 w-6 text-primary" />
                <h3 className="mt-3 text-base">{title as string}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {text as string}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-16">
        <p className="eyebrow">Our Journey</p>
        <h2 className="mt-2 text-2xl sm:text-3xl">From a Spark to a Movement</h2>
        <ol className="mt-8 grid gap-6 border-l border-border pl-6 sm:grid-cols-2 sm:border-l-0 sm:pl-0 lg:grid-cols-4">
          {timeline.map(([year, title, text]) => (
            <li key={year} className="relative sm:pt-6">
              <span className="hidden h-px w-full bg-border sm:block" />
              <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-primary sm:left-0 sm:top-[-5px]" />
              <p className="mt-3 text-sm font-extrabold text-primary">{year}</p>
              <h3 className="mt-1 text-lg">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Featured Products */}
      <section className="mt-16">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Featured Products</p>
            <h2 className="mt-2 text-2xl sm:text-3xl">Signature Drops & Bestsellers</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore the pieces that define the SparkZen aesthetic.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
          >
            View all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {productList.slice(0, 4).map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <section className="mt-14">
        <TrustBar />
      </section>

      <section
        className="mt-14 flex flex-col items-center gap-5 rounded-3xl px-8 py-14 text-center text-primary-foreground"
        style={{ background: "var(--gradient-blood)" }}
      >
        <h2 className="max-w-xl text-3xl sm:text-4xl">Ready to wear the movement?</h2>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-bold text-ink-foreground"
        >
          Shop Now <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </SiteLayout>
  );
}
