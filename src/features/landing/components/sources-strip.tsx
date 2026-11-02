"use client";

import { motion } from "framer-motion";
import { SOURCES } from "../lib/sources";

export function SourcesStrip() {
  return (
    <section aria-labelledby="sources-heading" className="border-y border-white/5 bg-white/[0.02] py-12">
      <div className="mx-auto max-w-6xl px-6">
        <h2 id="sources-heading" className="text-sm text-zinc-500">
          Built on {SOURCES.length} public data sources. No paid feeds, and every claim names where it came from.
        </h2>
        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
          className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 lg:grid-cols-7"
        >
          {SOURCES.map((s) => (
            <motion.li key={s.name} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
              <a href={s.url} target="_blank" rel="noreferrer noopener" className="group block">
                <span className="block text-sm font-medium text-zinc-200 transition-colors group-hover:text-white">{s.name}</span>
                <span className="block text-xs text-zinc-500">{s.feeds}</span>
              </a>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
