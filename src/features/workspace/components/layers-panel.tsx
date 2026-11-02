"use client";

import { Layers as LayersIcon } from "lucide-react";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { cn } from "@/lib/utils";
import { useLayerStats, type LayerStat } from "../hooks/use-layer-stats";
import { LAYER_META, LAYER_ORDER, pluralize } from "../lib/layer-meta";
import { Switch } from "./switch";
import { Art, type ArtKind } from "@/components/ui/art";

const LAYER_ART: Partial<Record<string, ArtKind>> = { earthquakes: "quake", wildfires: "fire", weather: "weather", airQuality: "air", flights: "flight" };

function describe(stat: LayerStat, enabled: boolean, unit: (typeof LAYER_META)["weather"]["unit"]): string {
  if (!enabled) return "Hidden";
  switch (stat.state) {
    case "loading":
      return "Loading…";
    case "error":
      return "Unavailable right now";
    case "note":
      return stat.note;
    case "ready":
      return pluralize(stat.count, unit);
  }
}

export function LayersPanel() {
  const { layers, toggleLayer, focusedLayer, setFocusedLayer } = useGlobeUi();
  const stats = useLayerStats();
  const onCount = LAYER_ORDER.filter((key) => layers[key]).length;

  return (
    <section aria-labelledby="layers-heading" className="dock-panel rounded-2xl">
      <header className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <LayersIcon className="h-4 w-4 text-muted" />
          <h2 id="layers-heading" className="text-sm font-medium text-foreground">
            Data layers
          </h2>
        </div>
        <span className="rounded-md bg-surface-elevated px-2 py-1 text-xs text-muted">
          {onCount} on
        </span>
      </header>

      <ul className="flex flex-col gap-1 px-2 pb-2">
        {LAYER_ORDER.map((key) => {
          const { label, icon: Icon, unit } = LAYER_META[key];
          const enabled = layers[key];
          const focused = focusedLayer === key;

          return (
            <li
              key={key}
              className={cn(
                "flex items-center gap-1 rounded-xl border pr-3 transition-colors",
                focused ? "border-border bg-surface-elevated" : "border-transparent hover:bg-surface-elevated/50"
              )}
            >
              <button
                type="button"
                onClick={() => setFocusedLayer(key)}
                aria-pressed={focused}
                aria-label={`Explore ${label}`}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2.5 text-left"
              >
                {LAYER_ART[key] ? (
                  <Art kind={LAYER_ART[key]!} size={40} float={enabled} className={cn("transition-[opacity,filter] duration-300", !enabled && "opacity-40 grayscale")} />
                ) : (
                  <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center transition-colors", enabled ? "text-accent" : "text-muted")}>
                    <Icon className="h-5 w-5" />
                  </span>
                )}
                <span className="min-w-0">
                  <span className={cn("block text-sm font-medium", enabled ? "text-foreground" : "text-muted")}>
                    {label}
                  </span>
                  <span className="block truncate text-xs tabular-nums text-muted">
                    {describe(stats[key], enabled, unit)}
                  </span>
                </span>
              </button>
              <Switch checked={enabled} onCheckedChange={() => toggleLayer(key)} label={`Show ${label} on globe`} />
            </li>
          );
        })}
      </ul>

      <p className="border-t border-border px-4 py-3 text-xs text-muted">
        Pick a layer to explore its signals, or flip a switch to show it on the globe.
      </p>
    </section>
  );
}
