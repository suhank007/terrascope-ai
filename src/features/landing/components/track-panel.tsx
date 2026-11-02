"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CountUp } from "./count-up";

const ROUTE = "M 36 232 C 170 8, 470 8, 604 232";
const PROGRESS = 0.62;

const FACTS = [
  { label: "Altitude", node: <>FL<CountUp to={370} /></> },
  { label: "Ground speed", node: <><CountUp to={481} /> kt</> },
  { label: "Heading", node: <><CountUp to={285} />° WNW</> },
  { label: "Vertical", node: <>Level</> },
  { label: "Flown", node: <><CountUp to={3410} /> km</> },
  { label: "To go", node: <><CountUp to={2090} /> km</> },
];

export function TrackPanel() {
  const reduce = useReducedMotion();

  return (
    <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr]">
      <div>
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <div>
            <p className="font-mono text-3xl font-semibold text-white">BA117</p>
            <p className="text-sm text-zinc-500">British Airways · callsign BAW117</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-medium text-accent">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden />
            In the air
          </span>
        </div>

        <div className="relative">
          <svg viewBox="0 0 640 260" className="w-full" role="img" aria-label="A flight arc from London to New York, 62 percent complete">
            <defs>
              <linearGradient id="track-done" x1="0" x2="1">
                <stop offset="0%" stopColor="#ef233c" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ef233c" />
              </linearGradient>
            </defs>
            {[0.2, 0.4, 0.6, 0.8].map((y) => (
              <line key={y} x1="0" x2="640" y1={260 * y} y2={260 * y} stroke="#fff" strokeOpacity="0.05" />
            ))}
            <path d={ROUTE} fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="2" strokeDasharray="3 7" />
            <motion.path d={ROUTE} fill="none" stroke="url(#track-done)" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: reduce ? PROGRESS : 0 }} whileInView={{ pathLength: PROGRESS }} viewport={{ once: true }} transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }} />
            <circle cx="36" cy="232" r="6" fill="#fff" />
            <circle cx="604" cy="232" r="6" fill="none" stroke="#fff" strokeWidth="2" />
          </svg>

          <motion.span
            aria-hidden
            className="absolute left-0 top-0 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_6px_rgba(239,35,60,0.25),0_0_24px_rgba(239,35,60,0.6)]"
            style={{ offsetPath: `path("${ROUTE}")`, offsetRotate: "0deg" }}
            initial={{ offsetDistance: reduce ? `${PROGRESS * 100}%` : "0%" }}
            whileInView={{ offsetDistance: `${PROGRESS * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
          />
          <div className="mt-2 flex justify-between text-sm">
            <span><span className="font-mono font-semibold text-white">LHR</span> <span className="text-zinc-500">London</span></span>
            <span><span className="text-zinc-500">New York</span> <span className="font-mono font-semibold text-white">JFK</span></span>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <dl>
          {FACTS.map((f) => (
            <div key={f.label} className="flex items-baseline justify-between gap-6 border-b border-white/10 py-3">
              <dt className="text-sm text-zinc-500">{f.label}</dt>
              <dd className="font-mono text-sm text-white">{f.node}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-sm text-white">
          About <span className="font-semibold">2 h 20 min</span> to go at the current speed. <span className="text-zinc-500">A straight-line estimate, never presented as the airline&apos;s time.</span>
        </p>
        <p className="mt-auto pt-6 text-xs leading-relaxed text-zinc-500">
          Illustration of a typical London to New York flight. Real flights are tracked from live ADS-B data by flight number, callsign or registration.
        </p>
        <Link href="/flights" className="mt-3 inline-flex min-h-10 items-center text-sm font-medium text-noir hover:underline">
          Track a real flight →
        </Link>
      </div>
    </div>
  );
}
