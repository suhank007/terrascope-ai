import { cn } from "@/lib/utils";

export interface FactItem {
  label: string;
  value: React.ReactNode;
  /** Small supporting line under the value. */
  note?: React.ReactNode;
}

/**
 * A property list: label on the left, value on the right, hairline between rows.
 * Replaces boxed tiles, which nested a card inside every section.
 */
export function Facts({ items, columns = 1, className }: { items: FactItem[]; columns?: 1 | 2; className?: string }) {
  return (
    <dl className={cn("grid gap-x-10", columns === 2 && "sm:grid-cols-2", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline justify-between gap-6 border-b border-border/60 py-2.5">
          <dt className="shrink-0 text-sm text-muted">{item.label}</dt>
          <dd className="min-w-0 text-right text-sm text-foreground">
            {item.value}
            {item.note && <span className="mt-0.5 block text-xs text-muted">{item.note}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
