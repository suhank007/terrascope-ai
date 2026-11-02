"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Compass, Plane, PlaneTakeoff, type LucideIcon } from "lucide-react";
import { Art, type ArtKind } from "@/components/ui/art";
import { EASE_OUT_EXPO, SPRING_PANEL } from "@/lib/motion";
import { cn } from "@/lib/utils";

const TABS: { href: string; label: string; icon: LucideIcon; match: string }[] = [
  { href: "/trip", label: "Trip Brief", icon: Compass, match: "/trip" },
  { href: "/flights", label: "Flights", icon: Plane, match: "/flights" },
  { href: "/airports", label: "Airports", icon: PlaneTakeoff, match: "/airports" },
];

/** The frame every travel page shares: back to the globe, the three tools, then the page heading. */
export function TravelShell({ title, intro, art, children }: { icon?: LucideIcon; art?: ArtKind; title: string; intro: string; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="h-dvh overflow-y-auto bg-background">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pt-6">
        <header className="flex items-center justify-between gap-4">
          <Link href="/globe" className="flex min-h-10 items-center gap-2 text-sm text-muted transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Globe
          </Link>
          <nav aria-label="Travel tools" className="flex gap-1">
            {TABS.map((tab) => {
              const active = pathname.startsWith(tab.match);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-11 items-center gap-2 rounded-full px-3.5 text-sm transition-colors sm:h-9",
                    active ? "font-medium text-foreground" : "text-muted hover:text-foreground"
                  )}
                >
                  {active && <motion.span layoutId="travel-tab" transition={SPRING_PANEL} className="absolute inset-0 rounded-full bg-surface-elevated" aria-hidden />}
                  <tab.icon className={cn("relative h-4 w-4", active && "text-accent")} aria-hidden />
                  <span className={cn("relative", !active && "hidden sm:inline")}>{tab.label}</span>
                </Link>
              );
            })}
          </nav>
        </header>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_OUT_EXPO }} className="flex items-center justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{intro}</p>
          </div>
          {art && <Art kind={art} size={96} className="hidden sm:inline-block" />}
        </motion.div>

        {children}
      </div>
    </div>
  );
}
