"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function Cta() {
  return (
    <section className="bg-noir-deep/40 px-6 py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="mx-auto max-w-3xl">
        <h2 className="text-balance text-5xl font-bold tracking-tighter text-white sm:text-7xl">
          Ready to <span className="text-noir">look?</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">Free to use, no account needed to explore. Start with the globe, or go straight to the trip you&apos;re planning.</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/globe" className="noir-cta group inline-flex h-14 items-center gap-3 px-9 text-base font-medium text-white">
            Open the live globe
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
          <Link href="/trip" className="inline-flex h-14 items-center rounded-full border border-zinc-800 bg-zinc-900/70 px-8 text-base text-zinc-200 transition-colors hover:border-zinc-700 hover:text-white">
            Plan a trip
          </Link>
          <Link href="/airports" className="inline-flex h-14 items-center px-6 text-base text-zinc-400 transition-colors hover:text-white">
            Check an airport
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
