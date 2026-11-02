import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Severity } from "../types";
import { SEVERITY } from "./severity";

/**
 * An open section, not a card: a heading, then content, set off from the one
 * above by a hairline and whitespace. Travel pages keep filled panels for the
 * verdict and the planner only, so those two read as the important surfaces.
 */
export function TripCard({
  id,
  title,
  aside,
  children,
  className,
}: {
  id: string;
  /** Kept so existing call sites compile; section headings are text only. */
  icon?: LucideIcon;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={cn("scroll-mt-20 border-t border-border py-8 first:border-t-0 first:pt-0", className)}>
      <header className="mb-4 flex items-baseline justify-between gap-4">
        <h2 id={`${id}-heading`} className="text-base font-semibold text-foreground">
          {title}
        </h2>
        {aside}
      </header>
      {children}
    </section>
  );
}

/** A section whose source didn't respond: say so, never imply "all clear". */
export function Unavailable({ reason }: { reason: string }) {
  return (
    <p role="status" className="text-sm text-muted">
      {reason} Try again in a few minutes.
    </p>
  );
}

export function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className="text-sm text-accent hover:underline">
      {children} ↗
    </a>
  );
}

/** A status as a dot and a word. Colour is reinforced by the word, never alone. */
export function SeverityPill({ severity, children }: { severity: Severity; children?: React.ReactNode }) {
  const style = SEVERITY[severity];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", style.text)}>
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", style.dot)} aria-hidden />
      {children ?? style.label}
    </span>
  );
}
