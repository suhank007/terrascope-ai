"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plane } from "lucide-react";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { AIRLINES } from "../lib/airlines";
import { cn } from "@/lib/utils";

export function AirlineFilter() {
  const { selectedAirlines, toggleAirline, clearAirlineFilter } = useGlobeUi();
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

  const activeCount = selectedAirlines.size;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Filter flights by airline"
        className={cn(
          "glass-panel flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          activeCount > 0 ? "text-accent" : "text-muted hover:text-foreground"
        )}
      >
        <Plane className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">
          {activeCount > 0 ? `${activeCount} airline${activeCount > 1 ? "s" : ""}` : "Filter by Airline"}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="glass-panel-elevated absolute right-0 top-11 z-30 max-h-96 w-64 overflow-y-auto rounded-2xl p-2 shadow-2xl"
          >
            <div className="flex items-center justify-between px-2 py-1.5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Filter airlines</p>
              {activeCount > 0 && (
                <button onClick={clearAirlineFilter} className="text-[10px] text-accent hover:underline">
                  Clear
                </button>
              )}
            </div>
            <ul className="flex flex-col gap-0.5">
              {AIRLINES.map((airline) => {
                const active = selectedAirlines.has(airline.icaoPrefix);
                return (
                  <li key={airline.icaoPrefix}>
                    <button
                      onClick={() => toggleAirline(airline.icaoPrefix)}
                      aria-pressed={active}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-surface-elevated"
                    >
                      <span className="text-foreground">{airline.name}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-[10px] text-muted">{airline.icaoPrefix}</span>
                        {active && <Check className="h-3.5 w-3.5 text-accent" />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
