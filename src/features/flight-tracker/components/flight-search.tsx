"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { parseFlightQuery } from "../lib/query";

const EXAMPLES = ["BA117", "EK1", "AI101", "QF1", "UAL55"];

export function FlightSearch({ initial, onSearch }: { initial: string; onSearch: (query: string) => void }) {
  const [text, setText] = useState(initial);
  const [invalid, setInvalid] = useState(false);

  const submit = (value: string) => {
    const parsed = parseFlightQuery(value);
    setInvalid(parsed === null);
    if (parsed) onSearch(parsed.text);
  };

  return (
    <section aria-label="Track a flight" className="dock-panel rounded-2xl p-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(text);
        }}
      >
        <label htmlFor="flight-query" className="mb-1.5 block text-sm text-muted">
          Flight number, callsign or registration
        </label>
        <div className="flex gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-surface-elevated py-3 pl-4 pr-3 transition-colors focus-within:border-accent/60">
            <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
            <input
              id="flight-query"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setInvalid(false);
              }}
              placeholder="e.g. BA117"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-invalid={invalid}
              aria-describedby={invalid ? "flight-query-hint" : undefined}
              className="w-full bg-transparent font-mono text-base uppercase text-foreground placeholder:font-sans placeholder:normal-case placeholder:text-muted focus:outline-none"
            />
          </div>
          <button type="submit" className="h-12 shrink-0 rounded-xl bg-accent px-5 text-sm font-semibold text-background transition-colors hover:bg-accent-strong active:scale-[0.98]">
            Track
          </button>
        </div>
        {invalid && (
          <p id="flight-query-hint" role="alert" className="mt-2 text-sm text-danger">
            That doesn&apos;t look like a flight. Try a flight number like BA117, a callsign like BAW117, or a registration like G-BODO.
          </p>
        )}
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">Try</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              setText(ex);
              submit(ex);
            }}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-sm text-foreground transition-colors hover:border-accent/50 hover:text-accent active:scale-95 sm:min-h-9 sm:px-3.5 font-mono"
          >
            {ex}
          </button>
        ))}
      </div>
    </section>
  );
}
