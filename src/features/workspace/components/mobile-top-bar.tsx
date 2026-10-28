"use client";

import { Globe2 } from "lucide-react";
import { AlertsBell } from "@/features/alerts/components/alerts-bell";
import { AccountLauncher } from "@/features/auth/components/account-launcher";
import { SearchBar } from "@/features/search/components/search-bar";
import { useLiveStatus } from "@/features/globe/hooks/use-live-status";
import { cn } from "@/lib/utils";

/** Two compact rows over the globe: identity + alerts/account, then search.
 *  Replaces the old four-row stack of floating pills. */
export function MobileTopBar({ hidden = false }: { hidden?: boolean }) {
  const status = useLiveStatus();

  return (
    <div className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] transition-opacity duration-200",
        hidden && "invisible opacity-0"
      )}>
      <div className="flex items-center justify-between gap-2">
        <div className="glass-panel-elevated pointer-events-auto flex items-center gap-2.5 rounded-full py-1.5 pl-2 pr-3.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Globe2 className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground">TerraScope AI</span>
          <span
            role="status"
            aria-label={status === "connecting" ? "Connecting" : "Live data"}
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              status === "connecting" ? "bg-muted" : "bg-accent",
              status === "live" && "animate-pulse-ring",
              status === "updating" && "animate-pulse"
            )}
          />
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <AlertsBell />
          <AccountLauncher />
        </div>
      </div>
      <div className="pointer-events-auto">
        <SearchBar className="max-w-none" placeholder="Search a city or country…" />
      </div>
    </div>
  );
}
