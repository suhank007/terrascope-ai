"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PlaneTakeoff, Search, X } from "lucide-react";
import { useAirportSearch } from "../hooks/use-airports";
import { flagEmoji } from "../lib/format";

export function AirportSearch({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(text), 250);
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

  const { data, isFetching } = useAirportSearch(debounced);
  const results = data?.results ?? [];

  return (
    <div ref={ref} className="relative">
      <label htmlFor="airport-search" className="mb-1.5 block text-xs font-medium text-muted">
        Find an airport
      </label>
      <div className="glass-panel-elevated flex items-center gap-2 rounded-xl py-3 pl-4 pr-3 transition-colors focus-within:border-accent/50">
        <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
        <input
          id="airport-search"
          value={text}
          autoFocus={autoFocus}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) router.push(`/airports/${results[0].iata}`);
          }}
          placeholder="City, airport name or code, e.g. Heathrow or LHR"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls="airport-search-list"
          className="w-full bg-transparent text-base text-foreground placeholder:text-muted focus:outline-none"
        />
        {isFetching && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted" aria-hidden />}
        {text && !isFetching && (
          <button type="button" onClick={() => { setText(""); setDebounced(""); }} aria-label="Clear" className="shrink-0 text-muted hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && debounced.trim().length >= 2 && (
        <ul id="airport-search-list" role="listbox" className="glass-panel-elevated absolute inset-x-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-xl p-1.5 shadow-2xl">
          {results.length === 0 && !isFetching && <li className="px-3 py-3 text-center text-sm text-muted">No airports found</li>}
          {results.map((a) => (
            <li key={a.iata} role="option" aria-selected={false}>
              <button type="button" onClick={() => router.push(`/airports/${a.iata}`)} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-elevated">
                <PlaneTakeoff className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                <span className="font-mono text-sm font-semibold text-foreground">{a.iata}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-foreground">{a.name}</span>
                  <span className="block truncate text-xs text-muted">
                    {flagEmoji(a.countryCode)} {a.city}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
