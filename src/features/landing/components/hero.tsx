"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Plane } from "lucide-react";
import { useEarthquakes } from "@/features/earthquakes/hooks/use-earthquakes";
import { useWildfires } from "@/features/wildfires/hooks/use-wildfires";
import type { Severity } from "@/features/trip/types";
import { useAirportBoard } from "../hooks/use-airport-board";
import { SOURCES } from "../lib/sources";
import { HeroVideo } from "./hero-video";
import { OrbitGlobe } from "./orbit-globe";

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } };
const item: Variants = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } };

function Callout({ tone, iata, text, className }: { tone: "alert" | "ok"; iata: string; text: string; className: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute max-w-[15rem] rounded-xl border bg-black/70 px-3.5 py-2.5 backdrop-blur-md ${tone === "alert" ? "border-noir/40" : "border-accent/30"} ${className}`}
    >
      <p className="flex items-center gap-2 text-xs text-zinc-400">
        <span className={`h-1.5 w-1.5 rounded-full ${tone === "alert" ? "bg-noir" : "bg-accent"}`} aria-hidden />
        <span className="font-mono font-semibold text-white">{iata}</span> {tone === "alert" ? "right now" : "normal"}
      </p>
      <p className="mt-1 line-clamp-2 text-sm leading-snug text-white">{text}</p>
    </motion.div>
  );
}

export function Hero() {
  const quakes = useEarthquakes();
  const fires = useWildfires();
  const board = useAirportBoard();

  const rows = useMemo(() => board.data?.rows ?? [], [board.data]);
  const levels = useMemo(() => Object.fromEntries(rows.map((r) => [r.iata, r.level])) as Record<string, Severity>, [rows]);
  const worst = rows.find((r) => r.level === "high") ?? rows.find((r) => r.level === "caution");
  const calm = rows.find((r) => r.level === "none");

  const live = quakes.data
    ? `${quakes.data.quakes.length} earthquakes${fires.data?.configured ? ` · ${fires.data.count} fire detections` : ""} in the last 24 hours`
    : "Reading live feeds";

  return (
    <section className="relative flex min-h-dvh items-center px-6 pb-20 pt-32">
      <HeroVideo />
      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
        <motion.div variants={container} initial="hidden" animate="show" className="text-center lg:text-left">
          <motion.div variants={item} className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="text-xs text-zinc-300">
              <span className="font-medium text-white">Live.</span> {live}
            </span>
          </motion.div>

          <motion.h1 variants={item} className="text-balance text-5xl font-semibold leading-[1.04] tracking-tighter text-white sm:text-6xl xl:text-7xl">
            Every threat, delay and detour,{" "}
            <span className="relative inline-block text-noir">
              before
              <motion.svg aria-hidden viewBox="0 0 100 10" preserveAspectRatio="none" className="absolute -bottom-1.5 left-0 h-2.5 w-full text-noir/70">
                <motion.path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }} />
              </motion.svg>
            </span>{" "}
            you fly.
          </motion.h1>

          <motion.p variants={item} className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-zinc-400 lg:mx-0">
            TerraScope watches live earthquakes, wildfires, weather and aircraft, reads government advisories and airport conditions, then tells you what it found and what it could not check.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
            <Link href="/globe" className="noir-cta group inline-flex h-14 items-center gap-3 px-9 text-base font-medium text-white">
              Open the live globe
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
            <Link href="/trip" className="inline-flex h-14 items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-8 text-base text-zinc-200 transition-colors hover:border-zinc-700 hover:text-white">
              <Plane className="h-4 w-4" aria-hidden />
              Plan a trip
            </Link>
          </motion.div>

          <motion.dl variants={item} className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6 text-left lg:max-w-lg">
            {[
              ["4,000+", "airports"],
              [String(SOURCES.length), "public sources"],
              ["0", "accounts to explore"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd>
                  <span className="block font-mono text-2xl font-semibold text-white">{value}</span>
                  <span className="text-sm text-zinc-500">{label}</span>
                </dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }} className="relative mx-auto aspect-square w-full max-w-[34rem]">
          <OrbitGlobe levels={levels} fires={fires.data?.configured ? fires.data.hotspots : undefined} quakes={quakes.data?.quakes} />
          {worst && <Callout tone="alert" iata={worst.iata} text={worst.reason ?? worst.headline} className="-left-1 top-[14%] sm:left-0" />}
          {calm && <Callout tone="ok" iata={calm.iata} text={calm.headline} className="-right-1 bottom-[12%] sm:right-0" />}
        </motion.div>
      </div>
    </section>
  );
}
