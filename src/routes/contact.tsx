import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Instagram, Youtube, Music2, Send, MessageCircle, ExternalLink, CheckCircle } from "lucide-react";
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
import spiderManImg from "@/assets/products/Spider Man.jpeg";
import akImg from "@/assets/products/AK.jpeg";
import bmwLogoImg from "@/assets/products/BMW logo.jpeg";
import gtaImg from "@/assets/products/GTA.jpeg";
import raavanImg from "@/assets/products/Raavan.jpeg";
import ajithImg from "@/assets/products/Ajith.jpeg";
import spidermanImg from "@/assets/products/Spiderman.jpeg";

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

const WHATSAPP_NUMBER = "919363447850";

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

const gallery = [heroHoodie, spiderManImg, akImg, bmwLogoImg, gtaImg, raavanImg, ajithImg];

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    order: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);

    const msg = `Hi SparkZen, I'm ${formData.name} (${formData.phone || formData.email}).\n${
      formData.order ? `Order ID: ${formData.order}\n` : ""
    }Message: ${formData.message}`;

    const waUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(msg)}`;
    
    toast.success("Thank you! Opening WhatsApp to connect directly with our support team.");
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

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
              Orders, sizing, collabs or custom drops — reach us on WhatsApp, email or call us directly. We reply promptly.
            </p>
          </div>
          <img
            src={spiderManImg}
            alt="SparkZen streetwear"
            className="aspect-square w-full rounded-2xl object-cover"
          />
        </div>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Contact Form */}
        <form
          className="surface-card rounded-2xl p-7 flex flex-col justify-between"
          onSubmit={handleSubmit}
        >
          <div>
            <h2 className="text-2xl font-bold">Send Us A Message</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Fill out the details below to connect directly with our team.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-extrabold uppercase tracking-[0.14em]">Full name</span>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </label>

              <label className="block">
                <span className="text-xs font-extrabold uppercase tracking-[0.14em]">Email</span>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@email.com"
                  className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </label>

              <label className="block">
                <span className="text-xs font-extrabold uppercase tracking-[0.14em]">Phone</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 00000 00000"
                  className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </label>

              <label className="block">
                <span className="text-xs font-extrabold uppercase tracking-[0.14em]">Order ID (optional)</span>
                <input
                  type="text"
                  name="order"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  placeholder="SZ-10234"
                  className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </label>
            </div>
            <label className="mt-4 block">
              <span className="text-xs font-extrabold uppercase tracking-[0.14em]">Message</span>
              <textarea
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us what's on your mind (sizing question, order query, custom drop)..."
                className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] cursor-pointer"
            >
              {sent ? (
                <>
                  <CheckCircle className="h-4 w-4" /> Message Sent
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Send Message
                </>
              )}
            </button>
            <a
              href={`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(
                "Hi SparkZen, I have a question about my order / products."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02] cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </div>
        </form>

        <aside className="space-y-4">
          <a
            href="mailto:hello@sparkzen.in"
            className="surface-card flex gap-4 rounded-2xl p-5 hover:border-primary/50 transition-colors block cursor-pointer"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                Email us
              </p>
              <p className="mt-1 text-sm font-bold text-foreground">hello@sparkzen.in</p>
              <p className="text-xs text-muted-foreground">Replies within 24 hours</p>
            </div>
          </a>

          <a
            href={`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="surface-card flex gap-4 rounded-2xl p-5 hover:border-emerald-500/50 transition-colors block cursor-pointer"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                  WhatsApp Support
                </p>
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-bold text-emerald-500">
                  Instant
                </span>
              </div>
              <p className="mt-1 text-sm font-bold text-foreground">+91 93634 47850</p>
              <p className="text-xs text-muted-foreground">Mon-Sat, 10am - 8pm IST</p>
            </div>
          </a>

          <a
            href="tel:+919363447850"
            className="surface-card flex gap-4 rounded-2xl p-5 hover:border-primary/50 transition-colors block cursor-pointer"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Phone className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                Call us
              </p>
              <p className="mt-1 text-sm font-bold text-foreground">+91 93634 47850</p>
              <p className="text-xs text-muted-foreground">Mon-Sat, 10am - 7pm IST</p>
            </div>
          </a>

          <div className="surface-card flex gap-4 rounded-2xl p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                Studio Address
              </p>
              <p className="mt-1 text-sm font-bold">Nungambakkam, Chennai</p>
              <p className="text-xs text-muted-foreground">Tamil Nadu 600034, India</p>
            </div>
          </div>

          <div className="panel-ink rounded-2xl p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink-muted">
              Follow the movement
            </p>
            <div className="mt-4 flex gap-3">
              {[
                { icon: Instagram, href: "https://instagram.com/sparkzen.clothing", label: "Instagram" },
                { icon: Music2, href: "https://tiktok.com/@sparkzen", label: "TikTok" },
                { icon: Youtube, href: "https://youtube.com/@sparkzen", label: "YouTube" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
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
            Still stuck? Message us on WhatsApp or fill out the form above.
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
