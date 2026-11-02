"use client";

import { motion } from "framer-motion";

const ROWS: { ask: string; why: string; instead: string }[] = [
  { ask: "Is my flight late?", why: "Delays need airline schedules, which come from a paid data source.", instead: "We show where it is now, plus FAA delay programmes for US airports." },
  { ask: "Hotel prices and availability", why: "Booking and Airbnb don't offer open data, and scraping breaks their terms.", instead: "Search links that open on their own sites, with your dates filled in." },
  { ask: "Ratings and reviews", why: "TripAdvisor and similar need a paid or partner licence.", instead: "Top sights ranked by Wikipedia coverage, labelled as fame, not quality." },
  { ask: "Live road traffic to the airport", why: "Traffic-aware routing is a paid API.", instead: "Ride and transit links from the airport page." },
  { ask: "Transit and rail tickets", why: "There is no global ticketing API.", instead: "Rome2rio and an OpenStreetMap transit map." },
  { ask: "Smartwatch alerts", why: "They need a native app, and this is a web app.", instead: "Not available yet." },
];

export function Limits() {
  return (
    <section id="limits" className="scroll-mt-24 border-t border-white/5 px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-medium text-noir">What TerraScope doesn&apos;t know yet</p>
          <h2 className="text-balance mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">The honest list</h2>
          <p className="mt-4 text-lg leading-relaxed text-zinc-400">Built on free public data, so some things stay out of reach. Here is each one, why, and what to use instead.</p>
        </div>

        <div className="hidden grid-cols-[1.1fr_1.4fr_1.4fr] gap-8 border-b border-white/10 pb-3 text-sm text-zinc-500 md:grid">
          <span>You might ask</span>
          <span>Why it&apos;s missing</span>
          <span>What you get instead</span>
        </div>
        <ul>
          {ROWS.map((r, i) => (
            <motion.li key={r.ask} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ delay: i * 0.04, duration: 0.5 }} className="grid gap-1.5 border-b border-white/10 py-5 md:grid-cols-[1.1fr_1.4fr_1.4fr] md:gap-8">
              <p className="text-base font-medium text-white">{r.ask}</p>
              <p className="text-sm leading-relaxed text-zinc-400">{r.why}</p>
              <p className="text-sm leading-relaxed text-zinc-300">{r.instead}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
