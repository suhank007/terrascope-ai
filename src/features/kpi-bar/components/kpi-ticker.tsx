"use client";

import { Activity, Gauge, Plane } from "lucide-react";
import { useEarthquakes } from "@/features/earthquakes/hooks/use-earthquakes";
import { useFlights } from "@/features/flights/hooks/use-flights";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { filterFlightsByAirlines } from "@/features/flights/lib/filter-airlines";
import { deriveKpis } from "../lib/derive-kpis";
import { useAnimatedNumber } from "@/lib/use-animated-number";

function StatShell({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Activity;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 px-3">
      <Icon className="h-3.5 w-3.5 text-accent" />
      <span className="text-sm font-medium tabular-nums text-foreground">{children}</span>
      <span className="hidden text-xs text-muted sm:inline">{label}</span>
    </div>
  );
}

function CountStat({
  icon,
  count,
  label,
  suffix = "",
}: {
  icon: typeof Activity;
  count: number;
  label: string;
  suffix?: string;
}) {
  const animated = useAnimatedNumber(count);
  return (
    <StatShell icon={icon} label={label}>
      {Math.round(animated).toLocaleString()}
      {suffix}
    </StatShell>
  );
}

function MagnitudeStat({ magnitude }: { magnitude: number | null }) {
  const animated = useAnimatedNumber(magnitude ?? 0, 600, 1);
  return (
    <StatShell icon={Gauge} label="strongest">
      {magnitude !== null ? `M${animated.toFixed(1)}` : "—"}
    </StatShell>
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
      <CountStat icon={Activity} count={kpis.earthquakeCount} label="quakes · 24h" />
      <MagnitudeStat magnitude={kpis.strongestMagnitude} />
      <CountStat
        icon={Plane}
        count={kpis.flightCount}
        label="flights in view"
        suffix={kpis.flightsTruncated ? "+" : ""}
      />
    </div>
  );
}
