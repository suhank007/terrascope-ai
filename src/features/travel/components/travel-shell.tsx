"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Compass, Plane, PlaneTakeoff, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS: { href: string; label: string; icon: LucideIcon; match: string }[] = [
  { href: "/trip", label: "Trip Brief", icon: Compass, match: "/trip" },
  { href: "/flights", label: "Flights", icon: Plane, match: "/flights" },
  { href: "/airports", label: "Airports", icon: PlaneTakeoff, match: "/airports" },
];

/** The frame every travel page shares: back to the globe, the three tools, then the page heading. */
export function TravelShell({ title, intro, children }: { icon?: LucideIcon; title: string; intro: string; children: React.ReactNode }) {
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
                    "flex h-9 items-center gap-2 rounded-full px-3.5 text-sm transition-colors",
                    active ? "bg-surface-elevated font-medium text-foreground" : "text-muted hover:text-foreground"
                  )}
                >
                  <tab.icon className={cn("h-4 w-4", active && "text-accent")} aria-hidden />
                  <span className={cn(!active && "hidden sm:inline")}>{tab.label}</span>
                </Link>
              );
            })}
          </nav>
        </header>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{intro}</p>
        </div>

        {children}
      </div>
    </div>
  );
}
