"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Compass, Globe2, Plane, PlaneTakeoff, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS: { href: string; label: string; icon: LucideIcon; match: string }[] = [
  { href: "/trip", label: "Trip Brief", icon: Compass, match: "/trip" },
  { href: "/flights", label: "Flights", icon: Plane, match: "/flights" },
  { href: "/airports", label: "Airports", icon: PlaneTakeoff, match: "/airports" },
];

/** The frame shared by every travel page: back to the globe, the three tabs, then the page's own heading. */
export function TravelShell({
  icon: Icon,
  title,
  intro,
  children,
}: {
  icon: LucideIcon;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="h-dvh overflow-y-auto bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 pb-16 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pt-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="flex min-h-10 items-center gap-2 rounded-full text-sm text-muted transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            <Globe2 className="h-4 w-4 text-accent" aria-hidden />
            <span className="font-medium text-foreground">TerraScope AI</span>
          </Link>
          <nav aria-label="Travel tools" className="flex gap-1 rounded-full border border-border bg-surface p-1">
            {TABS.map((tab) => {
              const active = pathname.startsWith(tab.match);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors active:scale-95",
                    active ? "bg-accent-soft text-accent" : "text-muted hover:text-foreground"
                  )}
                >
                  <tab.icon className="h-4 w-4" aria-hidden />
                  <span className={cn(!active && "hidden sm:inline")}>{tab.label}</span>
                </Link>
              );
            })}
          </nav>
        </header>

        <div>
          <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            <Icon className="h-7 w-7 text-accent sm:h-8 sm:w-8" aria-hidden />
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">{intro}</p>
        </div>

        {children}
      </div>
    </div>
  );
}
