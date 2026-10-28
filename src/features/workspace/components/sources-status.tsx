"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEarthquakes } from "@/features/earthquakes/hooks/use-earthquakes";
import { useWildfires } from "@/features/wildfires/hooks/use-wildfires";
import { useFlights } from "@/features/flights/hooks/use-flights";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Health = "ok" | "on-demand" | "degraded" | "down";

interface SourceRow {
  name: string;
  feeds: string;
  health: Health;
  note: string;
}

const HEALTH_DOT: Record<Health, string> = {
  ok: "bg-accent",
  "on-demand": "bg-muted",
  degraded: "bg-alert",
  down: "bg-danger",
};

function useSources(): SourceRow[] {
  const { layers } = useGlobeUi();
  const quakes = useEarthquakes();
  const wildfires = useWildfires();
  const flights = useFlights(layers.flights);

  return [
    {
      name: "USGS",
      feeds: "Earthquakes",
      health: quakes.isError ? "down" : "ok",
      note: quakes.isError ? "Not responding" : "Live",
    },
    {
      name: "NASA FIRMS",
      feeds: "Wildfires",
      health: wildfires.isError ? "down" : wildfires.data && !wildfires.data.configured ? "degraded" : "ok",
      note: wildfires.isError ? "Not responding" : wildfires.data && !wildfires.data.configured ? "API key missing" : "Live",
    },
    {
      name: "adsb.fi",
      feeds: "Flights",
      health: flights.isError ? "down" : flights.data?.degraded ? "degraded" : flights.isZoomedIn ? "ok" : "on-demand",
      note: flights.isError
        ? "Not responding"
        : flights.data?.degraded
          ? "Rate limited"
          : flights.isZoomedIn
            ? "Live"
            : "Loads when zoomed in",
    },
    { name: "Open-Meteo", feeds: "Weather", health: "on-demand", note: "Loads per city" },
    { name: "Open-Meteo", feeds: "Air quality", health: "on-demand", note: "Loads per city" },
  ];
}

/** Honest data-source health in one glanceable pill, expandable to the detail. */
export function SourcesStatus() {
  const sources = useSources();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const available = sources.filter((s) => s.health !== "down").length;
  const allGood = sources.every((s) => s.health === "ok" || s.health === "on-demand");

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`${available} of ${sources.length} data sources available`}
        className="flex items-center gap-2 rounded-full px-3 py-2 text-xs text-muted transition-colors hover:text-foreground"
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", allGood ? "bg-accent" : "bg-alert")} />
        <span className="tabular-nums">
          {available}/{sources.length} sources available
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
            className="glass-panel-elevated absolute right-0 top-11 z-30 w-72 rounded-2xl p-2 shadow-2xl"
          >
            <p className="px-2 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
              Sources & coverage
            </p>
            <ul>
              {sources.map((source) => (
                <li key={`${source.name}-${source.feeds}`} className="flex items-center gap-3 rounded-lg px-2 py-2">
                  <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", HEALTH_DOT[source.health])} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-foreground">{source.name}</span>
                    <span className="block text-xs text-muted">{source.feeds}</span>
                  </span>
                  <span className="text-xs text-muted">{source.note}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
