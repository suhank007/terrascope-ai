import Link from "next/link";
import { Globe2, Map } from "lucide-react";

const LINKS = [
  { href: "/trip", label: "Trip Brief" },
  { href: "/flights", label: "Flights" },
  { href: "/airports", label: "Airports" },
];

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-h-11 items-center gap-2 text-lg font-semibold tracking-tight">
          <Globe2 className="h-5 w-5 text-accent" aria-hidden />
          <span translate="no">TerraScope</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>

        <Link href="/globe" className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent-strong">
          <Map className="h-4 w-4" aria-hidden />
          Live globe
        </Link>
      </div>
    </header>
  );
}
