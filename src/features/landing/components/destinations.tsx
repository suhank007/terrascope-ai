"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { paramsFromQuery } from "@/features/trip/lib/query";
import { EASE_OUT_EXPO } from "@/lib/motion";

const PLACES = [
  { name: "Lisbon", country: "Portugal", cc: "PT", lat: 38.7223, lon: -9.1393, photo: "lisbon" },
  { name: "Tokyo", country: "Japan", cc: "JP", lat: 35.6762, lon: 139.6503, photo: "tokyo" },
  { name: "Dubai", country: "United Arab Emirates", cc: "AE", lat: 25.2048, lon: 55.2708, photo: "dubai" },
  { name: "New York", country: "United States", cc: "US", lat: 40.7128, lon: -74.006, photo: "newyork" },
  { name: "Paris", country: "France", cc: "FR", lat: 48.8566, lon: 2.3522, photo: "paris" },
  { name: "Sydney", country: "Australia", cc: "AU", lat: -33.8688, lon: 151.2093, photo: "sydney" },
];

export function Destinations() {
  return (
    <section id="destinations" aria-labelledby="dest-title" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-16 sm:px-6">
      <h2 id="dest-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Check a destination
      </h2>
      <p className="mt-1 text-base text-muted">Open a brief for a popular city. Search above for anywhere else.</p>

      <ul className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
        {PLACES.map((p, i) => (
          <motion.li key={p.name} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.45, delay: (i % 3) * 0.05, ease: EASE_OUT_EXPO }}>
            <Link
              href={`/trip?${paramsFromQuery({ name: p.name, cc: p.cc, lat: p.lat, lon: p.lon, home: "USD", mode: "leisure" }).toString()}`}
              className="group block"
            >
              <span className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-surface-elevated">
                <Image src={`/photos/${p.photo}.jpg`} alt="" fill sizes="(min-width: 1024px) 380px, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </span>
              <span className="mt-3 block text-lg font-semibold leading-tight group-hover:text-accent">{p.name}</span>
              <span className="block text-sm text-muted">{p.country}</span>
            </Link>
          </motion.li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted">Illustrative images, not photographs of the day.</p>
    </section>
  );
}
