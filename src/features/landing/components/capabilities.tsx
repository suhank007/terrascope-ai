"use client";

import { motion } from "framer-motion";
import { Activity, Bell, Bot, Compass, Globe2, PlaneTakeoff, Radar, Save, type LucideIcon } from "lucide-react";
import { useEarthquakes } from "@/features/earthquakes/hooks/use-earthquakes";
import { useWildfires } from "@/features/wildfires/hooks/use-wildfires";
import { cn } from "@/lib/utils";
import { CountUp } from "./count-up";

interface Card {
  icon: LucideIcon;
  title: string;
  text: string;
  specs: string[];
  className: string;
  tone?: string;
  /** Extra live content between the description and the spec list. */
  extra?: React.ReactNode;
}

/** The five globe layers, with the live counts the globe itself is showing right now. */
function LiveLayers() {
  const quakes = useEarthquakes();
  const fires = useWildfires();

  const rows: { dot: string; name: string; source: string; value: React.ReactNode }[] = [
    { dot: "#fb923c", name: "Earthquakes", source: "USGS, magnitude 2.5 and up", value: quakes.data ? <CountUp to={quakes.data.quakes.length} /> : "…" },
    { dot: "#ef233c", name: "Wildfires", source: "NASA FIRMS, last 24 hours", value: fires.data ? fires.data.configured ? <CountUp to={fires.data.count} /> : "n/a" : "…" },
    { dot: "#38bdf8", name: "Weather", source: "Open-Meteo, major cities", value: "20" },
    { dot: "#4ade80", name: "Air quality", source: "US AQI, major cities", value: "20" },
    { dot: "#35e0c8", name: "Flights", source: "adsb.fi, in the area you view", value: "Live" },
  ];

  return (
    <ul className="relative mt-7 border-t border-white/10">
      {rows.map((r) => (
        <li key={r.name} className="flex items-center gap-4 border-b border-white/10 py-3.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.dot }} aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-white">{r.name}</span>
            <span className="block text-xs text-zinc-500">{r.source}</span>
          </span>
          <span className="font-mono text-base font-semibold tabular-nums text-white">{r.value}</span>
        </li>
      ))}
    </ul>
  );
}

const CARDS: Card[] = [
  {
    icon: Globe2,
    title: "A live 3D globe",
    text: "Five layers on one globe, each with its own colour scale and a list you can read alongside it. Click any point for the detail.",
    specs: ["Earthquakes M2.5+, 24 hours", "Wildfires from satellite", "Weather in 20 cities", "Air quality (US AQI)", "Live aircraft in view", "Magnitude and airline filters"],
    className: "lg:col-span-2 lg:row-span-2",
    tone: "#ef233c",
    extra: <LiveLayers />,
  },
  {
    icon: Compass,
    title: "Trip Brief",
    text: "One verdict for a destination, then the detail behind it, for business or leisure.",
    specs: ["UK and US advisories", "CDC and WHO notices", "7-day forecast", "Exchange rate", "Top sights", "Booking links"],
    className: "lg:col-span-2",
    tone: "#35e0c8",
  },
  { icon: Radar, title: "Flight tracker", text: "Position, altitude, speed, heading and distance to go for any flight in the air.", specs: ["Flight number", "Callsign", "Registration"], className: "", tone: "#3b82f6" },
  { icon: PlaneTakeoff, title: "Airport outlook", text: "Decoded weather and FAA delay programmes, scored per airport.", specs: ["4,000+ airports", "METAR and TAF", "25 nm traffic"], className: "", tone: "#f5a623" },
  { icon: Bot, title: "AI copilot", text: "Ask in plain language. It reads the same live data before it answers, and cites what it used.", specs: ["Tool-using", "Live data only"], className: "lg:col-span-2", tone: "#a78bfa" },
  { icon: Bell, title: "Global alerts", text: "The strongest quakes and most intense fires, one tap from the globe.", specs: ["Severity ranked"], className: "", tone: "#ef233c" },
  { icon: Save, title: "Saved views", text: "Sign in with an email link and keep your camera, layers and filters.", specs: ["No password"], className: "", tone: "#35e0c8" },
];

export function Capabilities() {
  return (
    <section id="features" className="scroll-mt-24 border-t border-white/5 px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 max-w-2xl">
          <p className="text-sm font-medium text-noir">What is in it</p>
          <h2 className="text-balance mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Everything runs on the same live data</h2>
          <p className="mt-4 text-lg leading-relaxed text-zinc-400">One source of truth behind the globe, the trip brief, the tracker and the copilot, so they never disagree.</p>
        </div>

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={{ show: { transition: { staggerChildren: 0.07 } } }} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((c) => (
            <motion.article
              key={c.title}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } } }}
              whileHover={{ y: -3 }}
              className={cn("group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900/50 to-black p-7 transition-colors hover:border-white/20", c.className)}
            >
              <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-[0.1]" style={{ background: `radial-gradient(circle at top right, ${c.tone}, transparent 70%)` }} aria-hidden />
              <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5" style={{ color: c.tone }}>
                <c.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="relative mt-5 text-xl font-semibold tracking-tight text-white">{c.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-zinc-400">{c.text}</p>
              {c.extra}
              <ul className="relative mt-auto flex flex-wrap gap-x-4 gap-y-1.5 pt-6">
                {c.specs.map((s) => (
                  <li key={s} className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Activity className="h-3 w-3" style={{ color: c.tone }} aria-hidden />
                    {s}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
