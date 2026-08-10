import { Link } from "@tanstack/react-router";

export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <Link to="/" className="group inline-flex flex-col items-center leading-none">
      <span
        className={`text-xl font-extrabold tracking-tight ${
          tone === "light" ? "text-ink-foreground" : "text-foreground"
        }`}
      >
        SPARK<span className="text-primary">ZEN</span>
      </span>
      <span
        className={`mt-0.5 text-[0.55rem] font-bold tracking-[0.42em] ${
          tone === "light" ? "text-ink-muted" : "text-muted-foreground"
        }`}
      >
        CLOTHING
      </span>
    </Link>
  );
}
