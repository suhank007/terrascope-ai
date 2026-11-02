"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAirportBoard } from "../hooks/use-airport-board";

const DOT = { none: "bg-accent", caution: "bg-alert", high: "bg-noir", critical: "bg-noir" } as const;
const TEXT = { none: "text-zinc-300", caution: "text-alert", high: "text-noir", critical: "text-noir" } as const;

export function DelayPanel() {
  const { data, isLoading, isError, refetch } = useAirportBoard();

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-sm text-zinc-400">
          <span className="font-medium text-white">Live airport board.</span> Weather from NOAA, ground stops and delays from the FAA (US airports).
        </p>
        <p className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />Normal</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-alert" aria-hidden />Possible</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-noir" aria-hidden />Likely</span>
        </p>
      </div>

      {isLoading ? (
        <ul aria-busy="true" aria-label="Loading airport conditions" className="divide-y divide-white/10">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex items-center gap-4 py-4" aria-hidden>
              <span className="h-4 w-10 animate-pulse rounded bg-white/10" />
              <span className="h-3 w-1/3 animate-pulse rounded bg-white/10" />
            </li>
          ))}
        </ul>
      ) : isError || !data ? (
        <div role="alert" className="py-10 text-center">
          <p className="text-sm text-zinc-300">The live board couldn&apos;t be loaded right now.</p>
          <button type="button" onClick={() => void refetch()} className="mt-3 text-sm font-medium text-noir hover:underline">Try again</button>
        </div>
      ) : (
        <motion.ul initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }} className="divide-y divide-white/10">
          {data.rows.map((row) => (
            <motion.li key={row.iata} variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}>
              <Link href={`/airports/${row.iata}`} className="group grid grid-cols-[3rem_1fr_auto] items-center gap-x-4 gap-y-0.5 py-3.5 sm:grid-cols-[3.5rem_9rem_1fr_auto]">
                <span className="font-mono text-base font-semibold text-white transition-colors group-hover:text-noir">{row.iata}</span>
                <span className="truncate text-sm text-zinc-500 sm:block">{row.city}</span>
                <span className="col-start-2 col-end-4 row-start-2 min-w-0 sm:col-auto sm:row-auto">
                  <span className={cn("flex items-center gap-2 text-sm", TEXT[row.level])}>
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT[row.level])} aria-hidden />
                    {row.headline}
                  </span>
                  {row.reason && <span className="mt-0.5 line-clamp-1 block text-xs text-zinc-500">{row.reason}</span>}
                </span>
                <span className="row-start-1 justify-self-end font-mono text-xs text-zinc-500 sm:row-auto">{row.category ?? "n/a"}</span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      )}
      {data && <p className="mt-4 text-xs text-zinc-500">Checked {formatRelativeTime(data.generatedAt)}. Outside the US the outlook is weather only, because no free public delay feed exists. Tap an airport for the full picture.</p>}
    </div>
  );
}
