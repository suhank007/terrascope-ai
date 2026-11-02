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
  "h-11 w-full rounded-xl border border-border bg-surface-elevated px-3 text-base text-foreground transition-colors focus:border-accent/60 focus:outline-none [color-scheme:dark] disabled:opacity-50 xl:text-sm";

export function TripPlanner({ query, mode, onChange }: { query: TripQuery | null; mode: TravelMode; onChange: (patch: Partial<TripQuery>) => void }) {
  const datesInvalid = Boolean(query?.from && query?.to && query.to < query.from);
  const [optionsOpen, setOptionsOpen] = useState(false);
  // On a phone, once a trip exists the form folds to one line so the verdict is on the first screen.
  const [expanded, setExpanded] = useState(false);
  const summary = [query?.from && query?.to ? `${query.from} to ${query.to}` : query?.from ? `from ${query.from}` : "no dates", query?.home ?? "USD"].join(", ");

  return (
    <section aria-label="Plan your trip" className="dock-panel rounded-2xl p-5">
      {query && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          aria-controls="trip-planner-form"
          className="flex min-h-10 w-full items-center justify-between gap-3 text-left sm:hidden"
        >
          <span className="min-w-0 truncate text-sm">
            <span className="font-medium text-foreground">{query.name}</span>
            <span className="text-muted">, {mode}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-sm text-accent">
            {expanded ? "Done" : "Change"}
            <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} aria-hidden />
          </span>
        </button>
      )}
      <div id="trip-planner-form" className={cn(query && !expanded && "hidden sm:block", query && expanded && "mt-4 sm:mt-0")}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="min-w-0 flex-1">
          <DestinationPicker current={query?.name ?? null} onPick={(dest) => onChange(dest)} />
        </div>
        <fieldset>
          <legend className="mb-1.5 text-sm text-muted">Travelling for</legend>
          <div role="radiogroup" className="flex gap-1 rounded-xl bg-surface-elevated p-1">
            {MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                role="radio"
                aria-checked={mode === m.key}
                title={m.hint}
                onClick={() => onChange({ mode: m.key })}
                className={cn(
                  "flex h-9 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors active:scale-[0.98]",
                  mode === m.key ? "bg-background font-medium text-foreground" : "text-muted hover:text-foreground"
                )}
              >
                <m.icon className={cn("h-4 w-4", mode === m.key && "text-accent")} aria-hidden />
                {m.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {!query ? (
        <p className="mt-4 text-sm text-muted">
          Try{" "}
          {EXAMPLE_DESTINATIONS.map((d, i) => (
            <span key={d.name}>
              <button type="button" onClick={() => onChange(d)} className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent">
                {d.name}
              </button>
              {i < EXAMPLE_DESTINATIONS.length - 1 ? ", " : ""}
            </span>
          ))}
          .
        </p>
      ) : (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setOptionsOpen((o) => !o)}
            aria-expanded={optionsOpen}
            aria-controls="trip-options"
            className="-ml-1 flex min-h-9 items-center gap-1.5 rounded-lg px-1 text-sm text-muted transition-colors hover:text-foreground"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", optionsOpen && "rotate-180")} aria-hidden />
            Dates and currency <span className="text-muted/70">({summary})</span>
          </button>
          {optionsOpen && (
            <div id="trip-options" className="mt-3 grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="trip-from" className="mb-1.5 block text-sm text-muted">From</label>
                <input id="trip-from" type="date" value={query.from ?? ""} onChange={(e) => onChange({ from: e.target.value || undefined })} className={fieldClass} />
              </div>
              <div>
                <label htmlFor="trip-to" className="mb-1.5 block text-sm text-muted">To</label>
                <input id="trip-to" type="date" value={query.to ?? ""} min={query.from} onChange={(e) => onChange({ to: e.target.value || undefined })} aria-invalid={datesInvalid} className={cn(fieldClass, datesInvalid && "border-danger/60")} />
              </div>
              <div>
                <label htmlFor="trip-home" className="mb-1.5 block text-sm text-muted">Your currency</label>
                <select id="trip-home" value={query.home} onChange={(e) => onChange({ home: e.target.value })} className={fieldClass}>
                  {HOME_CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              {datesInvalid && (
                <p role="alert" className="text-sm text-danger sm:col-span-3">
                  The return date is before the start date, so it was left out of your booking links.
                </p>
              )}
            </div>
          )}
        </div>
      )}
      </div>
    </section>
  );
}
