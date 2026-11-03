import { CloudSun, Flame, HeartPulse, PlaneTakeoff, Radar, ShieldCheck, type LucideIcon } from "lucide-react";

const ITEMS: { icon: LucideIcon; title: string; text: string; sources: string }[] = [
  { icon: ShieldCheck, title: "Safety and entry", text: "Official travel advice for the country, and the risk level each government gives it.", sources: "UK FCDO, US State Department" },
  { icon: HeartPulse, title: "Health", text: "Current travel health notices and outbreaks that mention the destination.", sources: "CDC, WHO" },
  { icon: Flame, title: "Live hazards", text: "Recent earthquakes and fires near the destination. A city gets a small search area, a region a larger one.", sources: "USGS, NASA FIRMS" },
  { icon: CloudSun, title: "Weather and air", text: "Conditions now, a seven-day forecast and the air quality rating.", sources: "Open-Meteo" },
  { icon: PlaneTakeoff, title: "Airports", text: "Current airport weather, plus delays and flight holds reported by the FAA (US airports only).", sources: "NOAA Aviation Weather, FAA" },
  { icon: Radar, title: "Flights", text: "Where any flight in the air is now: position, height, speed and distance left.", sources: "adsb.fi, adsbdb" },
];

export function Checks() {
  return (
    <section id="checks" aria-labelledby="checks-title" className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20">
        <h2 id="checks-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          What it checks
        </h2>
        <p className="mt-1 max-w-2xl text-base text-muted">Free public sources only. Each section of a brief names where it came from, and says when a source couldn&apos;t be reached.</p>

        <ul className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((it) => (
            <li key={it.title}>
              <it.icon className="h-6 w-6 text-accent" aria-hidden />
              <h3 className="mt-3 text-lg font-semibold">{it.title}</h3>
              <p className="mt-1 text-base leading-relaxed text-muted">{it.text}</p>
              <p className="mt-2 text-sm text-foreground">Source: {it.sources}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
