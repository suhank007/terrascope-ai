"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Info, X } from "lucide-react";
import { EARTHQUAKE_LEGEND } from "@/features/earthquakes/lib/color-scale";
import { WEATHER_LEGEND } from "@/features/weather/lib/color-scale";
import { FLIGHT_LEGEND } from "@/features/flights/lib/color-scale";
import { WILDFIRE_LEGEND } from "@/features/wildfires/lib/color-scale";
import { AQI_LEGEND } from "@/features/air-quality/lib/aqi-scale";
import { useGlobeUi, type Layers } from "../context/globe-ui-context";

interface LegendEntry {
  label: string;
  hex: string;
}

interface LegendGroup {
  key: keyof Layers;
  title: string;
  entries: LegendEntry[];
}

const LEGEND_GROUPS: LegendGroup[] = [
  { key: "earthquakes", title: "Earthquakes — by magnitude", entries: EARTHQUAKE_LEGEND },
  { key: "weather", title: "Weather — by temperature", entries: WEATHER_LEGEND },
  { key: "flights", title: "Flights — by altitude", entries: FLIGHT_LEGEND },
  { key: "wildfires", title: "Wildfires — by confidence", entries: WILDFIRE_LEGEND },
  { key: "airQuality", title: "Air quality — by AQI", entries: AQI_LEGEND },
];

export function MapLegend() {
  const { layers } = useGlobeUi();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const activeGroups = LEGEND_GROUPS.filter((group) => layers[group.key]);

  return (
    <div ref={containerRef} className="relative">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="glass-panel-elevated absolute bottom-11 left-0 z-30 w-64 max-h-96 overflow-y-auto rounded-2xl p-3 shadow-2xl"
          >
            <div className="mb-1 flex items-center justify-between px-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Legend</p>
              <button onClick={() => setOpen(false)} aria-label="Close legend" className="text-muted hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {activeGroups.length === 0 && (
              <p className="px-1 py-2 text-xs text-muted">Turn on a layer to see what its colors mean.</p>
            )}

            <div className="flex flex-col gap-3">
              {activeGroups.map((group) => (
                <div key={group.key}>
                  <p className="mb-1 px-1 text-[11px] font-medium text-foreground">{group.title}</p>
                  <ul className="flex flex-col gap-1">
                    {group.entries.map((entry) => (
                      <li key={entry.label} className="flex items-center gap-2 px-1 text-xs text-muted">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/20"
                          style={{ backgroundColor: entry.hex }}
                        />
                        {entry.label}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close legend" : "Show map legend"}
        className="glass-panel flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
      >
        <Info className="h-3.5 w-3.5" />
        <span>Legend</span>
      </button>
    </div>
  );
}
