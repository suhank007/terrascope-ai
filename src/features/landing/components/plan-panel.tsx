"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BedDouble, Car, Plane, PlaneLanding, ShieldCheck, type LucideIcon } from "lucide-react";

const place = encodeURIComponent("New York, United States");

interface Step {
  icon: LucideIcon;
  title: string;
  detail: string;
  links?: { label: string; href: string; external?: boolean }[];
}

const STEPS: Step[] = [
  {
    icon: ShieldCheck,
    title: "Check the verdict",
    detail: "Advisories from the UK and US governments, CDC and WHO notices, live hazards and the forecast, with every reason and its source.",
    links: [{ label: "Open a Trip Brief", href: "/trip?name=New%20York&cc=US&lat=40.7128&lon=-74.006" }],
  },
  { icon: Plane, title: "Fly", detail: "Track the flight by number, callsign or registration: position, altitude, speed and distance to go.", links: [{ label: "Flight tracker", href: "/flights" }] },
  { icon: PlaneLanding, title: "Land", detail: "Weather, FAA ground stops and delay programmes, and the aircraft around the airport.", links: [{ label: "JFK conditions", href: "/airports/JFK" }] },
  {
    icon: BedDouble,
    title: "Check in",
    detail: "Hotel and apartment search for your dates, opened on the provider's own site. TerraScope links out and doesn't take bookings.",
    links: [
      { label: "Booking.com", href: `https://www.booking.com/searchresults.html?ss=${place}`, external: true },
      { label: "Airbnb", href: "https://www.airbnb.com/s/New%20York/homes", external: true },
    ],
  },
  {
    icon: Car,
    title: "Get around",
    detail: "Rides and transit options from the airport into the city.",
    links: [
      { label: "Rome2rio", href: "https://www.rome2rio.com/s/John%20F.%20Kennedy%20International%20Airport", external: true },
      { label: "Transit map", href: "https://www.openstreetmap.org/#map=13/40.7128/-74.0060&layers=O", external: true },
    ],
  },
];

export function PlanPanel() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <p className="text-sm text-zinc-500">Sample trip</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-white">London to New York, 3 nights</p>
        <div className="mt-6 rounded-2xl border border-alert/30 bg-alert/10 p-5">
          <p className="flex items-center gap-2 text-lg font-semibold text-white">
            <ShieldCheck className="h-5 w-5 text-alert" aria-hidden />
            Fine to go, with some care
          </p>
          <p className="mt-2 text-sm text-zinc-300">US State Department: Level 2, Exercise Increased Caution.</p>
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">Example of a verdict. Every real one lists its reasons with links, and says what it couldn&apos;t check.</p>
        </div>
      </div>

      <ol className="relative">
        <motion.span aria-hidden className="absolute bottom-3 left-[1.15rem] top-3 w-px origin-top bg-gradient-to-b from-noir via-white/20 to-white/5" initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: "easeOut" }} />
        {STEPS.map((step, i) => (
          <motion.li key={step.title} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="relative flex gap-5 pb-7 last:pb-0">
            <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-noir-ink text-white">
              <step.icon className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 pt-1">
              <h3 className="text-base font-medium text-white">{step.title}</h3>
              <p className="mt-1 max-w-md text-sm leading-relaxed text-zinc-400">{step.detail}</p>
              {step.links && (
                <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                  {step.links.map((l) =>
                    l.external ? (
                      <a key={l.label} href={l.href} target="_blank" rel="noreferrer noopener" className="text-sm text-noir hover:underline">
                        {l.label} ↗
                      </a>
                    ) : (
                      <Link key={l.label} href={l.href} className="text-sm text-noir hover:underline">
                        {l.label} →
                      </Link>
                    )
                  )}
                </p>
              )}
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
