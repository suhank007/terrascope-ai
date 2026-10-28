import { cn } from "@/lib/utils";

/** A real on/off switch (role="switch"), not a styled checkbox. */
export function Switch({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onCheckedChange}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full border transition-colors before:absolute before:-inset-x-1.5 before:-inset-y-3 before:content-['']",
        checked ? "border-accent/40 bg-accent/30" : "border-border bg-surface-elevated"
      )}
    >
      <span
        className={cn(
          "absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full transition-all duration-200",
          checked ? "left-[1.1rem] bg-accent-strong" : "left-0.5 bg-muted"
        )}
      />
    </button>
  );
}
