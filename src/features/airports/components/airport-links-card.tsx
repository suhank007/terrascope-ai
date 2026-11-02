import Link from "next/link";
import { LinkList, type LinkItem } from "@/components/ui/link-list";
import { TripCard } from "@/features/trip/components/trip-card";
import type { Airport } from "../types";

export function AirportLinksCard({ airport, className }: { airport: Airport; className?: string }) {
  const q = encodeURIComponent;
  const items: LinkItem[] = [];
  if (airport.website) items.push({ label: "Official airport website", hint: "Terminals, parking, flight boards", href: airport.website, external: true });
  if (airport.wikipedia) items.push({ label: "Wikipedia", hint: "History, terminals, airlines", href: airport.wikipedia, external: true });
  items.push(
    { label: "Duty-free and shops", hint: "Search on Google Maps", href: `https://www.google.com/maps/search/?api=1&query=${q(`duty free ${airport.name}`)}`, external: true },
    { label: "Lounges and food", hint: "Search on Google Maps", href: `https://www.google.com/maps/search/?api=1&query=${q(`restaurants ${airport.name}`)}`, external: true },
    { label: "Ride to the airport", hint: "Open Uber with this airport as the destination", href: `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff%5Blatitude%5D=${airport.latitude}&dropoff%5Blongitude%5D=${airport.longitude}&dropoff%5Bnickname%5D=${q(airport.name)}`, external: true },
    { label: "Trains and buses to the city", hint: "Rome2rio", href: `https://www.rome2rio.com/s/${q(airport.name)}`, external: true }
  );

  const tripHref = `/trip?name=${q(airport.city)}&cc=${airport.countryCode}&lat=${airport.latitude.toFixed(4)}&lon=${airport.longitude.toFixed(4)}`;

  return (
    <TripCard id="airport-links" title="Getting around" className={className}>
      <LinkList columns={2} items={items} />
      <Link href={tripHref} className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-accent hover:underline">
        Trip Brief for {airport.city} →
      </Link>
      <p className="mt-3 text-xs text-muted">
        Elevation {airport.elevationFt.toLocaleString()} ft · {airport.latitude.toFixed(2)}, {airport.longitude.toFixed(2)}. Airport data from OurAirports (public domain).
      </p>
    </TripCard>
  );
}
