"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search, X } from "lucide-react";
import { useGeocodeSearch } from "@/features/search/hooks/use-geocode-search";
import type { GeocodeResult } from "@/features/search/types";
import type { TripQuery } from "../lib/query";

type Picked = Pick<TripQuery, "name" | "cc" | "lat" | "lon">;

export function DestinationPicker({ current, onPick }: { current: string | null; onPick: (dest: Picked) => void }) {
  const [text, setText] = useState(current ?? "");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(text), 350);
    return () => clearTimeout(id);
  }, [text]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const { data, isFetching } = useGeocodeSearch(debounced);
  // A trip needs a country (advisories, currency, health all key off it), so
  // results without one (open ocean, odd features) can't be briefed.
  const results = (data?.results ?? []).filter((r): r is GeocodeResult & { countryCode: string } => r.countryCode !== null);

  const pick = (r: GeocodeResult & { countryCode: string }) => {
    setText(r.name);
    setOpen(false);
    onPick({ name: r.name, cc: r.countryCode, lat: r.latitude, lon: r.longitude });
  };

  return (
    <div ref={ref} className="relative">
      <label htmlFor="trip-destination" className="mb-1.5 block text-sm text-muted">
        Where are you going?
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-elevated py-3 pl-4 pr-3 transition-colors focus-within:border-accent/60">
        <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
        <input
          id="trip-destination"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="A city or country, e.g. Lisbon"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls="trip-destination-list"
          className="w-full bg-transparent text-base text-foreground placeholder:text-muted focus:outline-none"
        />
        {isFetching && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted" aria-hidden />}
        {text && !isFetching && (
          <button type="button" onClick={() => { setText(""); setDebounced(""); }} aria-label="Clear destination" className="shrink-0 text-muted hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && debounced.length >= 2 && (
        <ul
          id="trip-destination-list"
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-xl border border-border bg-surface-elevated p-1.5 shadow-2xl"
        >
          {results.length === 0 && !isFetching && <li className="px-3 py-3 text-center text-sm text-muted">No places found</li>}
          {results.map((r) => (
            <li key={r.id} role="option" aria-selected={false}>
              <button type="button" onClick={() => pick(r)} className="flex min-h-11 w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-elevated">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                <span className="min-w-0">
                  <span className="block text-sm text-foreground">{r.name}</span>
                  <span className="block truncate text-xs text-muted">{r.displayName}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
