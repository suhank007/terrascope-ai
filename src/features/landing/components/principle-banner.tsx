"use client";

import { motion } from "framer-motion";

const POINTS = [
  ["Every verdict shows its reasons", "Each one names the source and links to it, so you can check our reading against the original."],
  ["A failed feed is never all clear", "If a source doesn't respond, the page says what it couldn't check instead of staying quiet."],
  ["Estimates are labelled estimates", "Time left on a flight, and a route that doesn't match, are flagged as exactly that."],
];

export function PrincipleBanner() {
  return (
    <section className="bg-noir px-6 py-24 text-noir-ink">
      <div className="mx-auto max-w-6xl">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="text-balance max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
          If we can&apos;t check it, we say so.
        </motion.h2>
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {POINTS.map(([title, text], i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 + i * 0.1, duration: 0.6 }}>
              <p className="border-t border-noir-ink/30 pt-4 text-lg font-semibold">{title}</p>
              <p className="mt-2 text-base leading-relaxed text-noir-ink/80">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
