"use client";

import { Activity, CloudSun, Flame, Plane, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobeUi, type Layers } from "../context/globe-ui-context";

const LAYER_CONFIG: { key: keyof Layers; label: string; icon: typeof Activity }[] = [
  { key: "earthquakes", label: "Earthquakes", icon: Activity },
  { key: "weather", label: "Weather", icon: CloudSun },
  { key: "flights", label: "Flights", icon: Plane },
  { key: "wildfires", label: "Wildfires", icon: Flame },
  { key: "airQuality", label: "Air quality", icon: Wind },
];

export function LayerToggle() {
  const { layers, toggleLayer } = useGlobeUi();

  return (
    <div className="glass-panel flex flex-wrap gap-1 rounded-full p-1">
      {LAYER_CONFIG.map(({ key, label, icon: Icon }) => {
        const active = layers[key];
        return (
          <button
            key={key}
            onClick={() => toggleLayer(key)}
            aria-pressed={active}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors active:scale-95",
              active ? "bg-accent-soft text-accent" : "text-muted hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
