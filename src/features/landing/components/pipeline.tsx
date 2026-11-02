"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const GROUPS: { title: string; items: string[] }[] = [
  { title: "Hazards", items: ["USGS earthquakes", "NASA FIRMS fires"] },
  { title: "Airports", items: ["NOAA weather (METAR, TAF)", "FAA delays and ground stops", "adsb.fi aircraft"] },
  { title: "Advisories", items: ["UK Foreign Office", "US State Department", "CDC and WHO"] },
  { title: "Places and money", items: ["Open-Meteo forecast", "Wikidata sights", "ECB exchange rates"] },
];

const STEPS = [
  { n: "1", title: "Decode", text: "METAR codes become words. FAA XML becomes minutes. Government levels become one scale." },
  { n: "2", title: "Compare", text: "Fixed thresholds, not guesses: LIFR visibility is high risk, a ground stop is high risk, a partial FCDO warning is caution." },
  { n: "3", title: "Score", text: "One result: none, caution, high or critical. Critical is reserved for an official do-not-travel." },
];

const reveal = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

export function Pipeline() {
  return (
    <section id="how" className="scroll-mt-24 border-t border-white/5 px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 max-w-2xl">
          <p className="text-sm font-medium text-noir">How it decides</p>
          <h2 className="text-balance mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">No black box. Three plain steps.</h2>
          <p className="mt-4 text-lg leading-relaxed text-zinc-400">Every verdict is built from named sources and fixed rules, so you can see why it says what it says.</p>
        </div>

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={{ show: { transition: { staggerChildren: 0.15 } } }} className="grid items-stretch gap-6 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <motion.div variants={reveal} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <h3 className="text-sm font-medium text-zinc-500">Sources</h3>
            <div className="mt-4 flex flex-col gap-5">
              {GROUPS.map((g) => (
                <div key={g.title}>
                  <p className="text-sm font-medium text-white">{g.title}</p>
                  <ul className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                    {g.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          <Connector />

          <motion.div variants={reveal} className="rounded-2xl border border-noir/30 bg-gradient-to-b from-noir/10 to-transparent p-6">
            <h3 className="text-sm font-medium text-noir">TerraScope</h3>
            <ol className="mt-4 flex flex-col gap-6">
              {STEPS.map((s) => (
                <li key={s.n} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-noir/40 font-mono text-xs text-noir">{s.n}</span>
                  <div>
                    <p className="text-base font-medium text-white">{s.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-400">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>

          <Connector />

          <motion.div variants={reveal} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <h3 className="text-sm font-medium text-zinc-500">What you get</h3>
            <p className="mt-4 flex items-center gap-2.5 text-xl font-semibold text-white">
              <span className="h-2 w-2 rounded-full bg-noir" aria-hidden />
              Disruption likely
            </p>
            <ul className="mt-4 flex flex-col gap-3 text-sm">
              {[
                ["FAA ground stop in effect (thunderstorms).", "FAA", "bg-noir"],
                ["Departure delays of 31 to 45 min, increasing.", "FAA", "bg-alert"],
                ["Thunderstorms forecast in the next 12 hours.", "TAF", "bg-alert"],
              ].map(([text, source, dot]) => (
                <li key={text} className="flex gap-3">
                  <span className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", dot)} aria-hidden />
                  <span className="text-zinc-200">{text} <span className="text-zinc-500">{source}</span></span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-alert">Couldn&apos;t check: Forecast. This outlook may be incomplete.</p>
            <p className="mt-4 text-xs text-zinc-500">An example. A source that fails is named, never shown as all clear.</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Connector() {
  return (
    <motion.div variants={reveal} aria-hidden className="flex items-center justify-center py-1 lg:py-0">
      <svg viewBox="0 0 64 24" className="h-6 w-16 rotate-90 text-noir lg:rotate-0" fill="none">
        <motion.path d="M2 12 H56 M48 5 L58 12 L48 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3, ease: "easeOut" }} />
      </svg>
    </motion.div>
  );
}
