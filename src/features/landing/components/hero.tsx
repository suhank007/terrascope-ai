"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { SearchCard } from "./search-card";

export function Hero() {
  return (
    <section aria-labelledby="hero-title">
      <div className="relative h-[400px] overflow-hidden sm:h-[460px]">
        <Image src="/photos/hero.jpg" alt="" fill priority sizes="100vw" className="object-cover object-top" />
        <div className="absolute inset-0 bg-[#0b1d33]/25" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 pt-14 sm:px-6 sm:pt-20">
          <motion.h1
            id="hero-title"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
            className="max-w-2xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl"
          >
            Know what&apos;s happening before you go.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: EASE_OUT_EXPO }}
            className="mt-4 max-w-xl text-lg leading-relaxed text-white"
          >
            Live hazards, advisories, weather and airport conditions for any trip, with the source for every line.
          </motion.p>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-24 max-w-6xl px-4 sm:-mt-20 sm:px-6">
        <SearchCard />
      </div>
    </section>
  );
}
