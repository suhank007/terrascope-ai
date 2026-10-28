"use client";

import { SlidersHorizontal } from "lucide-react";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { AIRLINES } from "@/features/flights/lib/airlines";
import { cn } from "@/lib/utils";
import { LAYER_META } from "../lib/layer-meta";

const MAGNITUDE_STEPS: { value: number; label: string }[] = [
  { value: 0, label: "All" },
  { value: 3, label: "M3+" },
  { value: 4, label: "M4+" },
  { value: 5, label: "M5+" },
  { value: 6, label: "M6+" },
];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors active:scale-95",
        active
          ? "border-accent/40 bg-accent-soft text-accent"
          : "border-border text-muted hover:border-muted/40 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export function FilterControls() {
  const { focusedLayer, minMagnitude, setMinMagnitude, selectedAirlines, toggleAirline } = useGlobeUi();

  return (
    <>
        {focusedLayer === "earthquakes" && (
          <fieldset>
            <legend className="mb-2 text-xs text-muted">Minimum magnitude</legend>
            <div className="flex flex-wrap gap-1.5">
              {MAGNITUDE_STEPS.map((step) => (
                <Chip key={step.value} active={minMagnitude === step.value} onClick={() => setMinMagnitude(step.value)}>
                  {step.label}
                </Chip>
              ))}
            </div>
            <p className="mt-2.5 text-xs text-muted">Applies to the globe and the list.</p>
          </fieldset>
        )}

        {focusedLayer === "flights" && (
          <fieldset>
            <legend className="mb-2 flex w-full items-center justify-between text-xs text-muted">
              <span>Airlines</span>
              {selectedAirlines.size > 0 && <span className="text-accent">{selectedAirlines.size} selected</span>}
            </legend>
            <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto pr-1">
              {AIRLINES.map((airline) => (
                <Chip
                  key={airline.icaoPrefix}
                  active={selectedAirlines.has(airline.icaoPrefix)}
                  onClick={() => toggleAirline(airline.icaoPrefix)}
                >
                  {airline.name}
                </Chip>
              ))}
            </div>
          </fieldset>
        )}

        {focusedLayer !== "earthquakes" && focusedLayer !== "flights" && (
          <p className="text-xs leading-relaxed text-muted">
            {LAYER_META[focusedLayer].label} has no filters — every reading from {LAYER_META[focusedLayer].source} is
            shown. Try Earthquakes or Flights.
          </p>
        )}
    </>
  );
}

export function FiltersPanel() {
  const { minMagnitude, setMinMagnitude, selectedAirlines, clearAirlineFilter } = useGlobeUi();

  const isFiltered = minMagnitude > 0 || selectedAirlines.size > 0;
  const reset = () => {
    setMinMagnitude(0);
    clearAirlineFilter();
  };

  return (
    <section aria-labelledby="filters-heading" className="dock-panel rounded-2xl">
      <header className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="h-4 w-4 text-muted" />
          <h2 id="filters-heading" className="text-sm font-medium text-foreground">
            Filters
          </h2>
        </div>
        <button
          type="button"
          onClick={reset}
          disabled={!isFiltered}
          className="text-xs font-medium text-muted transition-colors enabled:hover:text-accent disabled:opacity-40"
        >
          Reset
        </button>
      </header>

      <div className="border-t border-border px-4 py-3.5">
        <FilterControls />
      </div>
    </section>
  );
}
