import { cn } from "@/lib/utils";
import { FiltersPanel } from "./filters-panel";
import { LayersPanel } from "./layers-panel";

export function LeftRail({ className }: { className?: string }) {
  return (
    <aside aria-label="Layers and filters" className={cn("min-h-0 flex-col gap-3 overflow-y-auto pr-0.5", className)}>
      <LayersPanel />
      <FiltersPanel />
    </aside>
  );
}
