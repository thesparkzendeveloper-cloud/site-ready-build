import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Instagram, Youtube, Music2, Send } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Crumbs } from "@/components/site/Crumbs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import heroHoodie from "@/assets/hero-hoodie.jpg";
import oversizedTee from "@/assets/product-oversized-tee.jpg";
import abstractTee from "@/assets/product-abstract-tee.jpg";
import sweatshirt from "@/assets/product-sweatshirt.jpg";
import longsleeve from "@/assets/product-longsleeve.jpg";
import graphicHoodie from "@/assets/product-graphic-hoodie.jpg";
import tote from "@/assets/product-tote.jpg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact SparkZen Clothing — We're Here to Help" },
      {
        name: "description",
        content:
          "Questions about sizing, orders or collabs? Message the SparkZen team, call us, or check the FAQs for quick answers.",
      },
      { property: "og:title", content: "Contact SparkZen Clothing — We're Here to Help" },
      {
        property: "og:description",
        content: "Reach the SparkZen team about orders, sizing, returns or collaborations.",
      },
    ],
  }),
  component: Contact,
});

const faqs = [
  [
    "How long does shipping take?",
    "Orders dispatch within 48 hours. Metro cities typically receive in 2-4 days, rest of India in 4-7 days.",
  ],
  [
    "What is your return policy?",
    "Unworn items with tags can be returned within 7 days of delivery. Return pickup is free across serviceable pincodes.",
  ],
  [
    "How do I pick the right size?",
    "Our fits run oversized. If you're between sizes, take your usual size for a relaxed fit or size down for a regular fit.",
  ],
  [
    "Do you restock sold-out drops?",
    "Rarely. Drops are limited runs — join the newsletter to get first access to the next one.",
  ],
  [
    "Do you ship internationally?",
    "Not yet. We're working on it — international shipping opens later this year.",
  ],
];

const gallery = [heroHoodie, oversizedTee, graphicHoodie, abstractTee, sweatshirt, longsleeve, tote];

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <SiteLayout>
      <Crumbs items={[{ label: "Home", to: "/" }, { label: "Contact Us" }]} />

      <section className="panel-ink relative mt-4 overflow-hidden rounded-3xl">
        <div className="grid items-center gap-8 px-6 py-12 sm:px-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="eyebrow">Contact Us</p>
            <h1 className="mt-3 text-4xl leading-tight text-ink-foreground sm:text-5xl">
              Got Something <span className="text-primary">To Say?</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-muted sm:text-base">
              Orders, sizing, collabs or just to say the hoodie hits — we read everything and reply
              within one business day.
            </p>
          </div>
          <img
            src={graphicHoodie}
            alt="SparkZen hoodie"
            className="aspect-square w-full rounded-2xl object-cover"
          />
        </div>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <form
          className="surface-card rounded-2xl p-7"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
            toast.success("Message sent — we'll get back to you within a day.");
          }}
        >
          <h2 className="text-2xl">Send Us A Message</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" name="name" placeholder="Your name" />
            <Field label="Email" name="email" type="email" placeholder="you@email.com" />
            <Field label="Phone" name="phone" placeholder="+91 00000 00000" />
            <Field label="Order ID (optional)" name="order" placeholder="SZ-10234" required={false} />
          </div>
          <label className="mt-4 block">
            <span className="text-xs font-extrabold uppercase tracking-[0.14em]">Message</span>
            <textarea
              name="message"
              required
              rows={5}
              placeholder="Tell us what's up..."
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </label>
          <button
            type="submit"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            <Send className="h-4 w-4" /> {sent ? "Message Sent" : "Send Message"}
          </button>
        </form>

        <aside className="space-y-4">
          {[
            [Mail, "Email us", "hello@sparkzen.in", "Replies within 24 hours"],
            [Phone, "Call us", "+91 98400 12345", "Mon-Sat, 10am - 7pm IST"],
            [MapPin, "Visit the studio", "Nungambakkam, Chennai", "Tamil Nadu 600034, India"],
          ].map(([Icon, title, main, sub]) => {
            const I = Icon as typeof Mail;
            return (
              <div key={title as string} className="surface-card flex gap-4 rounded-2xl p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <I className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                    {title as string}
                  </p>
                  <p className="mt-1 text-sm font-bold">{main as string}</p>
                  <p className="text-xs text-muted-foreground">{sub as string}</p>
                </div>
              </div>
            );
          })}

          <div className="panel-ink rounded-2xl p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink-muted">
              Follow the movement
            </p>
            <div className="mt-4 flex gap-3">
              {[Instagram, Music2, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social profile"
                  className="grid h-10 w-10 place-items-center rounded-full bg-ink-foreground/10 text-ink-foreground transition-colors hover:bg-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-16 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow">FAQs</p>
          <h2 className="mt-2 text-2xl sm:text-3xl">Quick answers</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Still stuck? Message us and a human will sort it out.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map(([q, a], i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-sm font-bold">{q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mt-16">
        <p className="eyebrow">@sparkzen.clothing</p>
        <h2 className="mt-2 text-2xl sm:text-3xl">Seen on the streets</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {gallery.map((src, i) => (
            <img
              key={i}
              src={src}
              alt="SparkZen community style"
              loading="lazy"
              className="aspect-square w-full rounded-xl object-cover transition-transform hover:scale-105"
            />
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-extrabold uppercase tracking-[0.14em]">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
      />
    </label>
  );
}
