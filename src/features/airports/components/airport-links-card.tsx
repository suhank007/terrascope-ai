import { ExternalLink, MapPinned } from "lucide-react";
import Link from "next/link";
import { TripCard } from "@/features/trip/components/trip-card";
import type { Airport } from "../types";

export function AirportLinksCard({ airport, className }: { airport: Airport; className?: string }) {
  const q = encodeURIComponent;
  const external = [
    airport.website && { label: "Official airport website", hint: "Terminals, parking, flight boards", url: airport.website },
    airport.wikipedia && { label: "Wikipedia", hint: "History, terminals, airlines", url: airport.wikipedia },
    { label: "Duty-free and shops", hint: "Search on Google Maps", url: `https://www.google.com/maps/search/?api=1&query=${q(`duty free ${airport.name}`)}` },
    { label: "Lounges and food", hint: "Search on Google Maps", url: `https://www.google.com/maps/search/?api=1&query=${q(`restaurants ${airport.name}`)}` },
    { label: "Ride to the airport", hint: "Open Uber with this airport as the destination", url: `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff%5Blatitude%5D=${airport.latitude}&dropoff%5Blongitude%5D=${airport.longitude}&dropoff%5Bnickname%5D=${q(airport.name)}` },
    { label: "Trains and buses to the city", hint: "Rome2rio", url: `https://www.rome2rio.com/s/${q(`${airport.name}`)}` },
  ].filter((l): l is { label: string; hint: string; url: string } => Boolean(l));

  const tripHref = `/trip?name=${q(airport.city)}&cc=${airport.countryCode}&lat=${airport.latitude.toFixed(4)}&lon=${airport.longitude.toFixed(4)}`;

  return (
    <TripCard id="airport-links" icon={MapPinned} title="Getting around" className={className}>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {external.map((link) => (
          <li key={link.label}>
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex min-h-11 items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2 transition-colors hover:border-accent/40"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{link.label}</span>
                <span className="block truncate text-xs text-muted">{link.hint}</span>
              </span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted group-hover:text-accent" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
      <Link href={tripHref} className="mt-3 flex min-h-11 items-center justify-between gap-3 rounded-lg border border-accent/30 bg-accent-soft px-3 py-2 text-sm font-medium text-accent transition-colors hover:border-accent/60">
        Trip Brief for {airport.city}
        <span aria-hidden>→</span>
      </Link>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        Elevation {airport.elevationFt.toLocaleString()} ft · {airport.latitude.toFixed(2)}, {airport.longitude.toFixed(2)}. Airport data from OurAirports (public domain).
      </p>
    </TripCard>
  );
}
