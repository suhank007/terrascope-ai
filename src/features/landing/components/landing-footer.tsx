import Link from "next/link";
import { Globe2 } from "lucide-react";

const EXPLORE = [
  { href: "/globe", label: "Live globe" },
  { href: "/trip", label: "Trip Brief" },
  { href: "/flights", label: "Flight tracker" },
  { href: "/airports", label: "Airports" },
];

const DATA = [
  { href: "https://earthquake.usgs.gov", label: "USGS" },
  { href: "https://firms.modaps.eosdis.nasa.gov", label: "NASA FIRMS" },
  { href: "https://aviationweather.gov", label: "NOAA Aviation Weather" },
  { href: "https://nasstatus.faa.gov", label: "FAA" },
  { href: "https://open-meteo.com", label: "Open-Meteo" },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Globe2 className="h-5 w-5 text-accent" aria-hidden />
            <span translate="no">TerraScope</span>
          </p>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-muted">A travel brief built from free public data. It says what it found, and what it could not check.</p>
        </div>
        <nav aria-label="Explore">
          <h2 className="text-sm font-semibold">Explore</h2>
          <ul className="mt-4 flex flex-col gap-1 text-base text-muted">
            {EXPLORE.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-9 items-center transition-colors hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Data sources">
          <h2 className="text-sm font-semibold">Data</h2>
          <ul className="mt-4 flex flex-col gap-1 text-base text-muted">
            {DATA.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noreferrer noopener" className="inline-flex min-h-9 items-center transition-colors hover:text-foreground">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-4 py-5 text-sm text-muted sm:px-6 md:flex-row">
          <p>Built by Ankit Parihar. Map tiles from Esri. Airport data from OurAirports (public domain).</p>
          <a href="https://github.com/suhank007/terrascope-ai" target="_blank" rel="noreferrer noopener" className="hover:text-foreground">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
