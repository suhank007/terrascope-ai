import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Severity } from "../types";
import { SEVERITY } from "./severity";

export function TripCard({
  id,
  icon: Icon,
  title,
  aside,
  children,
  className,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className={cn("dock-panel rounded-2xl", className)}>
      <header className="flex items-center justify-between gap-3 px-5 pb-1 pt-4">
        <div className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 text-muted" />
          <h2 id={`${id}-heading`} className="text-sm font-medium text-foreground">
            {title}
          </h2>
        </div>
        {aside}
      </header>
      <div className="px-5 pb-5 pt-3">{children}</div>
    </section>
  );
}

/** A section whose source didn't respond: say so, never imply "all clear". */
export function Unavailable({ reason }: { reason: string }) {
  return (
    <p role="status" className="rounded-lg border border-dashed border-border px-3 py-3 text-sm text-muted">
      {reason} Try again in a few minutes.
    </p>
  );
}

export function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-xs font-medium text-accent hover:underline">
      {children} ↗
    </a>
  );
}

export function SeverityPill({ severity, children }: { severity: Severity; children?: React.ReactNode }) {
  const style = SEVERITY[severity];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", style.bg, style.border, style.text)}>
      <style.icon className="h-3 w-3" />
      {children ?? style.label}
    </span>
  );
}
