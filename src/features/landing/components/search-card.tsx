"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Compass, Plane, PlaneTakeoff } from "lucide-react";
import { AirportSearch } from "@/features/airports/components/airport-search";
import { DestinationPicker } from "@/features/trip/components/destination-picker";
import { paramsFromQuery } from "@/features/trip/lib/query";
import { SPRING_PANEL } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Tab = "trip" | "flight" | "airport";

const TABS: { key: Tab; label: string; icon: typeof Compass; hint: string }[] = [
  { key: "trip", label: "Trip Brief", icon: Compass, hint: "Travel advice, health notices, hazards, forecast and sights for a destination." },
  { key: "flight", label: "Flight", icon: Plane, hint: "Where a flight is right now, how high and how fast." },
  { key: "airport", label: "Airport", icon: PlaneTakeoff, hint: "Current weather and FAA delays at an airport." },
];

function FlightField() {
  const router = useRouter();
  const [text, setText] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const q = text.trim();
        if (q) router.push(`/flights?q=${encodeURIComponent(q)}`);
      }}
    >
      <label htmlFor="landing-flight" className="mb-1.5 block text-sm text-muted">
        Flight number, callsign or registration
      </label>
      <div className="flex gap-2">
        <input
          id="landing-flight"
          name="flight"
          spellCheck={false}
          autoCapitalize="characters"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="BA117, EK1 or G-BODO…"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-xl border border-border bg-surface-elevated px-4 py-3 text-base text-foreground placeholder:text-muted focus-visible:border-accent"
        />
        <button type="submit" className="h-12 shrink-0 rounded-xl bg-accent px-6 text-base font-medium text-white transition-colors hover:bg-accent-strong active:scale-[0.98]">
          Track
        </button>
      </div>
    </form>
  );
}

export function SearchCard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("trip");
  const active = TABS.find((t) => t.key === tab)!;

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-[var(--shadow-float)] sm:p-6">
      <div role="tablist" aria-label="What do you want to check?" className="mb-5 flex gap-1 border-b border-border">
        {TABS.map((t) => {
          const selected = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              id={`tab-${t.key}`}
              aria-selected={selected}
              aria-controls="search-panel"
              onClick={() => setTab(t.key)}
              className={cn("relative flex min-h-11 items-center gap-2 px-3 pb-3 pt-2 text-sm font-medium sm:px-4", selected ? "text-accent" : "text-muted hover:text-foreground")}
            >
              <t.icon className="h-4 w-4" aria-hidden />
              {t.label}
              {selected && <motion.span layoutId="landing-tab" transition={SPRING_PANEL} className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent" aria-hidden />}
            </button>
          );
        })}
      </div>

      <div id="search-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === "trip" && (
          <DestinationPicker current={null} onPick={(d) => router.push(`/trip?${paramsFromQuery({ ...d, home: "USD", mode: "leisure" }).toString()}`)} />
        )}
        {tab === "flight" && <FlightField />}
        {tab === "airport" && <AirportSearch />}
        <p className="mt-3 text-sm text-muted">{active.hint}</p>
      </div>
    </div>
  );
}
