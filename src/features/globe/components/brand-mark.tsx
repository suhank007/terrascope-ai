"use client";

import { Globe2 } from "lucide-react";
import { useLiveStatus, type LiveStatus } from "../hooks/use-live-status";
import { cn } from "@/lib/utils";

const STATUS_COPY: Record<LiveStatus, string> = {
  connecting: "Connecting",
  live: "Live",
  updating: "Updating",
};

/** Wordmark + tagline + live-status, in one lockup — the app's identity
 *  should read in the first glance, not require a caption. */
export function BrandMark() {
  const status = useLiveStatus();

  return (
    <div className="glass-panel flex items-center gap-3 rounded-2xl py-2 pl-3 pr-4">
      <Globe2 className="h-4 w-4 shrink-0 text-accent" />
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold tracking-tight text-foreground">TerraScope AI</span>
        <span className="text-xs text-muted">Global Intelligence Platform</span>
      </div>
      <div className="ml-1 flex items-center gap-1.5 border-l border-border pl-3">
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            status === "connecting" ? "bg-muted" : "bg-accent",
            status === "live" && "animate-pulse-ring",
            status === "updating" && "animate-pulse"
          )}
        />
        <span className="text-xs font-medium uppercase tracking-wide text-muted">{STATUS_COPY[status]}</span>
      </div>
    </div>
  );
}
