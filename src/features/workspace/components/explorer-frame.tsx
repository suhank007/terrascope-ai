"use client";

import { useState } from "react";
import { AlertCircle, Power, RefreshCw, SlidersHorizontal } from "lucide-react";
import { useGlobeUi, type Layers } from "@/features/globe/context/globe-ui-context";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useNow } from "../hooks/use-now";
import { FilterControls } from "./filters-panel";
import { Switch } from "./switch";
import { LAYER_META } from "../lib/layer-meta";
import { SignalRowSkeleton } from "./signal-row";

interface ExplorerFrameProps {
  layer: keyof Layers;
  count: number | null;
  /** Small caps line above the list, e.g. "Past 24 hours". */
  scope: string;
  sortLabel: string;
  status: "loading" | "error" | "ready";
  isRefreshing: boolean;
  onRefresh: () => void;
  /** Epoch ms of the last successful load, for the footer. */
  updatedAt?: number;
  /** Rendered in place of the list when status is ready but there is nothing to show. */
  empty?: React.ReactNode;
  isEmpty?: boolean;
  children: React.ReactNode;
}

function Notice({ icon: Icon, title, body, action }: { icon: typeof Power; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div role="status" className="flex flex-col items-center gap-2 px-8 py-14 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-elevated text-muted">
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs leading-relaxed text-muted">{body}</p>
      {action}
    </div>
  );
}

const actionClass =
  "mt-2 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent/50 hover:text-accent active:scale-95";

export function ExplorerFrame({
  layer,
  count,
  scope,
  sortLabel,
  status,
  isRefreshing,
  onRefresh,
  updatedAt,
  empty,
  isEmpty,
  children,
}: ExplorerFrameProps) {
  const { layers, toggleLayer, minMagnitude, selectedAirlines } = useGlobeUi();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const now = useNow();
  const meta = LAYER_META[layer];
  const enabled = layers[layer];
  const filterable = layer === "earthquakes" || layer === "flights";
  const activeFilters = layer === "earthquakes" ? (minMagnitude > 0 ? 1 : 0) : layer === "flights" ? (selectedAirlines.size > 0 ? 1 : 0) : 0;
  const updated = updatedAt ? formatRelativeTime(new Date(Math.min(updatedAt, now)).toISOString()) : null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="px-5 pb-3 pt-3 xl:pb-4 xl:pt-5">
        <p className="hidden font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted xl:block">Signal explorer</p>
        <div className="flex xl:mt-3 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <h2 className="truncate text-xl font-semibold tracking-tight text-foreground">{meta.label}</h2>
            {enabled && count !== null && (
              <span className="rounded-md bg-surface-elevated px-2 py-1 font-mono text-xs font-medium tabular-nums text-foreground">
                {count.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
          {filterable && (
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              aria-expanded={filtersOpen}
              aria-label="Filters"
              title="Filters"
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors xl:hidden",
                filtersOpen ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-elevated hover:text-foreground"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilters > 0 && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />}
            </button>
          )}
          <span className="flex items-center gap-2 text-xs text-muted xl:hidden">
            <span className="hidden sm:inline">On globe</span>
            <Switch checked={enabled} onCheckedChange={() => toggleLayer(layer)} label={`Show ${meta.label} on globe`} />
          </span>
          <button
            type="button"
            onClick={onRefresh}
            disabled={!enabled}
            aria-label={`Refresh ${meta.label}`}
            title="Refresh"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors enabled:hover:bg-surface-elevated enabled:hover:text-foreground disabled:opacity-40 xl:h-8 xl:w-8"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </button>
          </div>
        </div>
        <p className="mt-1.5 hidden text-sm text-muted xl:block">{meta.blurb}</p>
        <p className="mt-1 text-xs text-muted xl:hidden">
          {scope} · {meta.source}
          {updated ? ` · ${updated}` : ""}
        </p>
      </header>

      {filterable && filtersOpen && (
        <div className="border-t border-border px-5 py-4 xl:hidden">
          <FilterControls />
        </div>
      )}

      <div className="hidden items-center justify-between border-y border-border px-5 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted xl:flex">
        <span>{scope}</span>
        <span className="normal-case tracking-normal">{sortLabel}</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {!enabled ? (
          <Notice
            icon={Power}
            title={`${meta.label} is hidden`}
            body="Turn this layer on to see its signals on the globe and in this list."
            action={
              <button type="button" onClick={() => toggleLayer(layer)} className={actionClass}>
                Show {meta.label.toLowerCase()}
              </button>
            }
          />
        ) : status === "loading" ? (
          <ul aria-busy="true" aria-label={`Loading ${meta.label}`}>
            {Array.from({ length: 7 }).map((_, i) => (
              <SignalRowSkeleton key={i} />
            ))}
          </ul>
        ) : status === "error" ? (
          <Notice
            icon={AlertCircle}
            title={`Couldn't load ${meta.label.toLowerCase()}`}
            body={`${meta.source} didn't respond. This usually clears up on its own.`}
            action={
              <button type="button" onClick={onRefresh} className={actionClass}>
                Try again
              </button>
            }
          />
        ) : isEmpty ? (
          empty
        ) : (
          <ul>{children}</ul>
        )}
      </div>

      <footer className="hidden items-center justify-between border-t border-border px-5 py-3 text-xs text-muted xl:flex">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {meta.source}
        </span>
        {updated ? <span className="tabular-nums">{updated}</span> : null}
      </footer>
    </div>
  );
}

export { Notice, actionClass };
