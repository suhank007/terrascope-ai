import Link from "next/link";

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
    <footer className="relative overflow-hidden border-t border-zinc-900 bg-black pb-10 pt-20">
      <div className="relative z-10 mx-auto mb-20 grid max-w-6xl grid-cols-1 gap-12 px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="flex items-center gap-2.5">
            <span className="h-4 w-4 rotate-45 rounded-[3px] bg-noir" aria-hidden />
            <span className="text-2xl font-semibold tracking-tight text-white">TerraScope</span>
          </p>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-zinc-500">A real-time picture of the planet, and a travel brief that tells you what it found and what it could not check. Built on free public data.</p>
        </div>
        <nav aria-label="Explore">
          <h2 className="text-sm font-medium text-noir">Explore</h2>
          <ul className="mt-5 flex flex-col gap-3 text-sm text-zinc-400">
            {EXPLORE.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-white">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Data sources">
          <h2 className="text-sm font-medium text-noir">Data</h2>
          <ul className="mt-5 flex flex-col gap-3 text-sm text-zinc-400">
            {DATA.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noreferrer noopener" className="transition-colors hover:text-white">{l.label} ↗</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p aria-hidden className="noir-outline-text pointer-events-none select-none py-6 text-center text-[15vw] font-bold leading-none tracking-tighter opacity-60">
        TERRASCOPE
      </p>

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-zinc-900 px-6 pt-8 text-xs text-zinc-600 md:flex-row">
        <p>Built by Ankit Parihar. Map tiles from Esri. Airport data from OurAirports (public domain).</p>
        <p className="flex gap-6">
          <a href="https://github.com/suhank007/terrascope-ai" target="_blank" rel="noreferrer noopener" className="transition-colors hover:text-zinc-400">GitHub ↗</a>
          <Link href="/globe" className="transition-colors hover:text-zinc-400">Open the globe</Link>
        </p>
      </div>
    </footer>
  );
}
