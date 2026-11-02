"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

function jump(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const LINKS = [
  { id: "live", label: "Live" },
  { id: "how", label: "How it decides" },
  { id: "features", label: "Features" },
  { id: "limits", label: "Limits" },
];

export function LandingNav() {
  return (
    <motion.header initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="fixed inset-x-0 top-0 z-50 px-4 pt-5">
      <nav aria-label="Primary" className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-white/10 bg-black/60 py-2 pl-4 pr-2 shadow-2xl backdrop-blur-xl sm:py-2.5 sm:pl-5 sm:pr-2.5">
        <Link href="/" className="flex items-center gap-2.5" aria-label="TerraScope AI home">
          <span className="h-4 w-4 rotate-45 rounded-[3px] bg-noir" aria-hidden />
          <span className="text-base font-semibold tracking-tight text-white">TerraScope</span>
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <li key={l.id}>
              <button type="button" onClick={() => jump(l.id)} className="text-sm text-zinc-400 transition-colors hover:text-white">
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <Link href="/trip" className="hidden h-10 items-center rounded-full px-4 text-sm text-zinc-300 transition-colors hover:text-white sm:flex">
            Plan a trip
          </Link>
          <Link href="/globe" className="group flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-black transition-transform active:scale-[0.97] sm:px-5">
            Open globe
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
