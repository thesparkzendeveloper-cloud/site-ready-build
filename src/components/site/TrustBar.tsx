import { Truck, ShieldCheck, Headphones } from "lucide-react";

const items = [
  { icon: Truck, title: "Free Shipping", text: "On orders above ₹999" },
  { icon: ShieldCheck, title: "Premium Quality", text: "Durable. Stylish. Reliable." },
  { icon: Headphones, title: "24/7 Support", text: "We're here for you" },
];

export function TrustBar({ variant = "light" }: { variant?: "light" | "red" }) {
  const red = variant === "red";
  return (
    <div
      className={`grid gap-6 rounded-2xl px-6 py-6 sm:grid-cols-2 lg:grid-cols-3 ${
        red ? "text-primary-foreground" : "surface-card"
      }`}
      style={red ? { background: "var(--gradient-blood)" } : undefined}
    >
      {items.map(({ icon: Icon, title, text }) => (
        <div key={title} className="flex items-center gap-3">
          <Icon className={`h-6 w-6 shrink-0 ${red ? "" : "text-primary"}`} />
          <div>
            <p className="text-sm font-bold">{title}</p>
            <p className={`text-xs ${red ? "opacity-85" : "text-muted-foreground"}`}>{text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
