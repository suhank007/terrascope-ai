"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Globe2, Map } from "lucide-react";
import { EASE_OUT_EXPO, SPRING_PANEL } from "@/lib/motion";
import { cn } from "@/lib/utils";

const TABS: { href: string; label: string; match: string }[] = [
  { href: "/trip", label: "Trip Brief", match: "/trip" },
  { href: "/flights", label: "Flights", match: "/flights" },
  { href: "/airports", label: "Airports", match: "/airports" },
];

/** The frame every travel page shares: a plain top bar (brand, the three tools, the globe), then the page heading. */
export function TravelShell({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="h-dvh overflow-y-auto bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex min-h-11 items-center gap-2 text-base font-semibold tracking-tight text-foreground" aria-label="TerraScope home">
            <Globe2 className="h-5 w-5 text-accent" aria-hidden />
            <span translate="no" className="hidden sm:inline">TerraScope</span>
          </Link>

          <nav aria-label="Travel tools" className="flex h-full items-stretch gap-1 sm:gap-3">
            {TABS.map((tab) => {
              const active = pathname.startsWith(tab.match);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={cn("relative flex items-center px-2.5 text-sm font-medium transition-colors sm:px-3", active ? "text-accent" : "text-muted hover:text-foreground")}
                >
                  {tab.label}
                  {active && <motion.span layoutId="travel-tab" transition={SPRING_PANEL} className="absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-accent" aria-hidden />}
                </Link>
              );
            })}
          </nav>

          <Link href="/globe" className="flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground" aria-label="Open the live globe">
            <Map className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Live globe</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-24 pt-8 sm:px-6 sm:pt-10">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-xl text-base leading-relaxed text-muted">{intro}</p>
        </motion.div>

        {children}
      </div>
    </div>
  );
}
