"use client";

import { useState } from "react";
import { Briefcase, ChevronDown, Palmtree } from "lucide-react";
import { cn } from "@/lib/utils";
import { EXAMPLE_DESTINATIONS, HOME_CURRENCIES, type TripQuery } from "../lib/query";
import type { TravelMode } from "../types";
import { DestinationPicker } from "./destination-picker";

const MODES: { key: TravelMode; label: string; icon: typeof Briefcase; hint: string }[] = [
  { key: "business", label: "Business", icon: Briefcase, hint: "Flights, ground transport and essentials first" },
  { key: "leisure", label: "Leisure", icon: Palmtree, hint: "Stays, sights and things to do first" },
];

const fieldClass =
  "h-11 w-full rounded-xl border border-border bg-surface-elevated/60 px-3 text-base text-foreground transition-colors focus:border-accent/50 focus:outline-none [color-scheme:dark] xl:text-sm";

export function TripPlanner({
  query,
  mode,
  onChange,
}: {
  query: TripQuery | null;
  mode: TravelMode;
  onChange: (patch: Partial<TripQuery>) => void;
}) {
  const datesInvalid = Boolean(query?.from && query?.to && query.to < query.from);
  // On a phone the form would fill the first screen, so dates and currency fold away once a trip exists.
  const [optionsOpen, setOptionsOpen] = useState(false);
  const optionsSummary = [
    query?.from && query?.to ? `${query.from} to ${query.to}` : query?.from ? `From ${query.from}` : "No dates",
    query?.home ?? "USD",
  ].join(" · ");

  return (
    <section aria-label="Plan your trip" className="dock-panel rounded-2xl p-4 sm:p-5">
      <DestinationPicker current={query?.name ?? null} onPick={(dest) => onChange(dest)} />

      {!query && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-muted">Or try one:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_DESTINATIONS.map((d) => (
              <button
                key={d.name}
                type="button"
                onClick={() => onChange(d)}
                className="h-10 rounded-full border border-border px-4 text-sm text-foreground transition-colors hover:border-accent/50 hover:text-accent active:scale-95"
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_auto]">
        <fieldset className="sm:col-span-2 lg:col-span-1">
          <legend className="mb-1.5 text-xs font-medium text-muted">I&apos;m travelling for</legend>
          <div role="radiogroup" className="flex gap-1 rounded-xl border border-border bg-background/40 p-1">
            {MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                role="radio"
                aria-checked={mode === m.key}
                title={m.hint}
                onClick={() => onChange({ mode: m.key })}
                className={cn(
                  "flex h-9 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors active:scale-95",
                  mode === m.key ? "bg-accent-soft text-accent" : "text-muted hover:text-foreground"
                )}
              >
                <m.icon className="h-4 w-4" aria-hidden />
                {m.label}
              </button>
            ))}
          </div>
        </fieldset>

        {query && (
          <button
            type="button"
            onClick={() => setOptionsOpen((o) => !o)}
            aria-expanded={optionsOpen}
            aria-controls="trip-options"
            className="flex h-11 items-center justify-between rounded-xl border border-border px-3 text-left text-sm text-muted transition-colors hover:text-foreground sm:hidden"
          >
            <span className="truncate">Dates and currency · {optionsSummary}</span>
            <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", optionsOpen && "rotate-180")} aria-hidden />
          </button>
        )}
        <div id="trip-options" className={cn("grid gap-4 sm:contents", query && !optionsOpen && "hidden sm:contents")}>
        <div>
            <label htmlFor="trip-from" className="mb-1.5 block text-xs font-medium text-muted">
              From (optional)
            </label>
            <input id="trip-from" type="date" value={query?.from ?? ""} onChange={(e) => onChange({ from: e.target.value || undefined })} disabled={!query} className={cn(fieldClass, "disabled:opacity-50")} />
          </div>
          <div>
            <label htmlFor="trip-to" className="mb-1.5 block text-xs font-medium text-muted">
              To (optional)
            </label>
            <input
              id="trip-to"
              type="date"
              value={query?.to ?? ""}
              min={query?.from}
              onChange={(e) => onChange({ to: e.target.value || undefined })}
              disabled={!query}
              aria-invalid={datesInvalid}
              className={cn(fieldClass, "disabled:opacity-50", datesInvalid && "border-danger/60")}
            />
          </div>
          <div>
            <label htmlFor="trip-home" className="mb-1.5 block text-xs font-medium text-muted">
              My currency
            </label>
            <select id="trip-home" value={query?.home ?? "USD"} onChange={(e) => onChange({ home: e.target.value })} disabled={!query} className={cn(fieldClass, "disabled:opacity-50 lg:w-28")}>
              {HOME_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {datesInvalid && (
        <p role="alert" className="mt-2 text-xs text-danger">
          The return date is before the start date, so it was left out of your booking links.
        </p>
      )}
    </section>
  );
}
