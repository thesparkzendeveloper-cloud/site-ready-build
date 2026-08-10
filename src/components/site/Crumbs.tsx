import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export function Crumbs({
  items,
  tone = "dark",
}: {
  items: { label: string; to?: "/" | "/shop" }[];
  tone?: "dark" | "light";
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-2 text-sm ${
        tone === "light" ? "text-ink-muted" : "text-muted-foreground"
      }`}
    >
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-2">
          {item.to ? (
            <Link to={item.to} className="hover:text-primary">
              {item.label}
            </Link>
          ) : (
            <span className={tone === "light" ? "text-ink-foreground" : "text-foreground"}>
              {item.label}
            </span>
          )}
          {i < items.length - 1 && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
        </span>
      ))}
    </nav>
  );
}
