"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Hotel, Plane, Radar, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DelayPanel } from "./delay-panel";
import { PlanPanel } from "./plan-panel";
import { ThreatPanel } from "./threat-panel";
import { TrackPanel } from "./track-panel";

const TABS: { id: string; label: string; icon: LucideIcon; title: string; blurb: string; panel: React.ReactNode }[] = [
  { id: "track", label: "Track", icon: Plane, title: "Follow one aircraft", blurb: "By flight number, callsign or registration: where it is, how high, how fast, how far it has left to go.", panel: <TrackPanel /> },
  { id: "delays", label: "Delays", icon: Clock, title: "See which airports are struggling", blurb: "Decoded weather and FAA ground stops, scored into one outlook per airport, with the reason beside it.", panel: <DelayPanel /> },
  { id: "threats", label: "Threats", icon: Radar, title: "Watch hazards land on the map", blurb: "Every earthquake and fire detection from the last 24 hours, from USGS and NASA, plotted as they are reported.", panel: <ThreatPanel /> },
  { id: "plan", label: "Plan", icon: Hotel, title: "From first check to hotel door", blurb: "The order you'll need things in: verdict, flight, landing, check-in, getting around.", panel: <PlanPanel /> },
];

export function Showcase() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const next = e.key === "ArrowRight" ? (i + 1) % TABS.length : e.key === "ArrowLeft" ? (i - 1 + TABS.length) % TABS.length : e.key === "Home" ? 0 : e.key === "End" ? TABS.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  };

  const tab = TABS[active];

  return (
    <section id="live" className="scroll-mt-24 px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-medium text-noir">Live, not a mock-up</p>
          <h2 className="text-balance mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Four ways to watch the world move</h2>
          <p className="mt-4 text-lg leading-relaxed text-zinc-400">Delays and threats below are running on real feeds right now. Track and Plan are clearly marked examples.</p>
        </div>

        <div role="tablist" aria-label="What TerraScope watches" className="flex border-b border-white/10">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => void (refs.current[i] = el)}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={active === i}
              aria-controls={`panel-${t.id}`}
              tabIndex={active === i ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn("relative flex h-12 flex-1 items-center justify-center gap-2 px-2 text-sm transition-colors sm:flex-none sm:justify-start sm:px-5", active === i ? "text-white" : "text-zinc-500 hover:text-zinc-200")}
            >
              <t.icon className={cn("h-4 w-4", active === i && "text-noir")} aria-hidden />
              {t.label}
              {active === i && <motion.span layoutId="showcase-underline" className="absolute inset-x-0 -bottom-px h-0.5 bg-noir" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/50 to-black/80 p-6 sm:p-9">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={tab.id} id={`panel-${tab.id}`} role="tabpanel" aria-labelledby={`tab-${tab.id}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>
              <h3 className="text-2xl font-semibold tracking-tight text-white">{tab.title}</h3>
              <p className="mb-8 mt-2 max-w-2xl text-base leading-relaxed text-zinc-400">{tab.blurb}</p>
              {tab.panel}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
