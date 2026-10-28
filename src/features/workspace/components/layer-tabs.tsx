"use client";

import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { cn } from "@/lib/utils";
import { useLayerStats } from "../hooks/use-layer-stats";
import { LAYER_META, LAYER_ORDER } from "../lib/layer-meta";

/** Horizontally scrolling layer picker for the mobile sheet. Tapping a tab
 *  focuses that layer's list; a faded icon means the layer is off the globe. */
export function LayerTabs({ onPick }: { onPick: () => void }) {
  const { layers, focusedLayer, setFocusedLayer } = useGlobeUi();
  const stats = useLayerStats();

  return (
    <div role="tablist" aria-label="Data layers" className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
      {LAYER_ORDER.map((key) => {
        const { label, icon: Icon } = LAYER_META[key];
        const stat = stats[key];
        const focused = focusedLayer === key;
        const enabled = layers[key];

        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={focused}
            onClick={() => {
              setFocusedLayer(key);
              onPick();
            }}
            className={cn(
              "flex h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors active:scale-95",
              focused
                ? "border-accent/40 bg-accent-soft text-accent"
                : "border-border text-foreground/80 hover:border-muted/40",
              !enabled && !focused && "text-muted"
            )}
          >
            <Icon className={cn("h-4 w-4", !enabled && !focused && "opacity-50")} />
            {label}
            {enabled && stat.state === "ready" && (
              <span className="font-mono text-xs tabular-nums text-muted">{stat.count.toLocaleString()}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
