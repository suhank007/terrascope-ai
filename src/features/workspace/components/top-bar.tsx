"use client";

import { Globe2 } from "lucide-react";
import { AlertsBell } from "@/features/alerts/components/alerts-bell";
import { AccountLauncher } from "@/features/auth/components/account-launcher";
import { SearchBar } from "@/features/search/components/search-bar";
import { useLiveStatus, type LiveStatus } from "@/features/globe/hooks/use-live-status";
import { cn } from "@/lib/utils";
import { SourcesStatus } from "./sources-status";

const STATUS_COPY: Record<LiveStatus, string> = {
  connecting: "Connecting",
  live: "Live",
  updating: "Updating",
};

export function TopBar({ className }: { className?: string }) {
  const status = useLiveStatus();

  return (
    <header className={cn("items-center gap-6 px-1", className)}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-accent">
          <Globe2 className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 leading-tight">
          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-semibold tracking-tight text-foreground">TerraScope AI</h1>
            <span className="flex items-center gap-1.5 rounded-full bg-surface px-2 py-0.5">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  status === "connecting" ? "bg-muted" : "bg-accent",
                  status === "live" && "animate-pulse-ring",
                  status === "updating" && "animate-pulse"
                )}
              />
              <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted">
                {STATUS_COPY[status]}
              </span>
            </span>
          </div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
            A world in motion
          </p>
        </div>
      </div>

      <SearchBar className="max-w-xl" placeholder="Search a city or country…" />

      <div className="flex flex-1 items-center justify-end gap-1.5">
        <SourcesStatus />
        <AlertsBell />
        <AccountLauncher />
      </div>
    </header>
  );
}
