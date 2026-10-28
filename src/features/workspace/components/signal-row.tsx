import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignalRowProps {
  icon: LucideIcon;
  title: string;
  meta: string;
  /** The row's one number (magnitude, temperature, AQI…), shown in data type. */
  badge?: string;
  badgeColor?: string;
  selected: boolean;
  onSelect: () => void;
}

export function SignalRow({ icon: Icon, title, meta, badge, badgeColor, selected, onSelect }: SignalRowProps) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? "true" : undefined}
        className={cn(
          "group flex w-full items-center gap-3 border-b border-border px-5 py-3 text-left transition-colors",
          selected ? "bg-accent-soft" : "hover:bg-surface-elevated/60"
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background/40 text-accent">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">{title}</span>
          <span className="block truncate text-xs text-muted">{meta}</span>
        </span>
        {badge && (
          <span className="shrink-0 font-mono text-[13px] font-medium tabular-nums" style={{ color: badgeColor }}>
            {badge}
          </span>
        )}
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
      </button>
    </li>
  );
}

export function SignalRowSkeleton() {
  return (
    <li className="flex items-center gap-3 border-b border-border px-5 py-3" aria-hidden>
      <span className="skeleton-shimmer h-9 w-9 shrink-0 rounded-lg bg-surface-elevated" />
      <span className="flex-1 space-y-2">
        <span className="skeleton-shimmer block h-3 w-3/4 rounded bg-surface-elevated" />
        <span className="skeleton-shimmer block h-2.5 w-1/2 rounded bg-surface-elevated" />
      </span>
      <span className="skeleton-shimmer h-3 w-8 rounded bg-surface-elevated" />
    </li>
  );
}
