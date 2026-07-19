"use client";

import { motion } from "framer-motion";
import { Activity, Gauge, Plane } from "lucide-react";
import { useEarthquakes } from "@/features/earthquakes/hooks/use-earthquakes";
import { useFlights } from "@/features/flights/hooks/use-flights";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { filterFlightsByAirlines } from "@/features/flights/lib/filter-airlines";
import { deriveKpis } from "../lib/derive-kpis";
import { formatMagnitude } from "@/lib/format";

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Activity;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3">
      <Icon className="h-3.5 w-3.5 text-accent" />
      <motion.span
        key={value}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm font-medium text-foreground"
      >
        {value}
      </motion.span>
      <span className="hidden text-xs text-muted sm:inline">{label}</span>
    </div>
  );
}

export function KpiTicker() {
  const { data: earthquakes } = useEarthquakes();
  const { data: flights } = useFlights();
  const { selectedAirlines } = useGlobeUi();

  const visibleFlightCount = flights ? filterFlightsByAirlines(flights.flights, selectedAirlines).length : 0;
  const kpis = deriveKpis(earthquakes?.quakes, visibleFlightCount, flights?.truncated ?? false);

  return (
    <div className="glass-panel flex divide-x divide-border rounded-full px-1 py-1">
      <Stat icon={Activity} value={String(kpis.earthquakeCount)} label="quakes · 24h" />
      <Stat
        icon={Gauge}
        value={kpis.strongestMagnitude !== null ? formatMagnitude(kpis.strongestMagnitude) : "—"}
        label="strongest"
      />
      <Stat
        icon={Plane}
        value={kpis.flightsTruncated ? `${kpis.flightCount}+` : String(kpis.flightCount)}
        label="flights in view"
      />
    </div>
  );
}
