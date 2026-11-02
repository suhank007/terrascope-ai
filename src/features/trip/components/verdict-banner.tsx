import { Info } from "lucide-react";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TripBrief } from "../types";
import { SEVERITY } from "./severity";
import { SeverityPill } from "./trip-card";

export function VerdictBanner({ brief }: { brief: TripBrief }) {
  const { verdict, destination, country } = brief;
  const style = SEVERITY[verdict.level];

  return (
    <section aria-labelledby="verdict-heading" className={cn("rounded-2xl border p-5 sm:p-6", style.bg, style.border)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
            <span aria-hidden>{country.flag}</span>
            {destination.name}, {destination.countryName}
          </p>
          <h2 id="verdict-heading" className="mt-2 flex items-center gap-3 text-2xl font-semibold tracking-tight text-foreground">
            <style.icon className={cn("h-6 w-6 shrink-0", style.text)} aria-hidden />
            {verdict.headline}
          </h2>
        </div>
        <SeverityPill severity={verdict.level} />
      </div>

      {verdict.reasons.length > 0 ? (
        <ul className="mt-5 flex flex-col gap-2">
          {verdict.reasons.map((reason, i) => {
            const rs = SEVERITY[reason.severity];
            return (
              <li key={`${reason.source}-${i}`} className="flex items-start gap-3 text-sm">
                <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", rs.dot)} aria-hidden />
                <span className="text-foreground">
                  <span className="sr-only">{rs.label}: </span>
                  {reason.text}{" "}
                  {reason.url ? (
                    <a href={reason.url} target="_blank" rel="noreferrer" className="whitespace-nowrap text-xs text-muted underline-offset-2 hover:text-accent hover:underline">
                      {reason.source} ↗
                    </a>
                  ) : (
                    <span className="whitespace-nowrap text-xs text-muted">{reason.source}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      ) : verdict.unchecked.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          Nothing in the government advisories, health notices, live hazards or forecast raised a flag.
        </p>
      ) : null}

      {verdict.unchecked.length > 0 && (
        <p role="status" className="mt-4 flex items-start gap-2 text-sm text-alert">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Couldn&apos;t check: {verdict.unchecked.join(", ")}. This summary may be incomplete.
        </p>
      )}

      <p className="mt-5 border-t border-border/60 pt-4 text-xs leading-relaxed text-muted">
        A summary of public feeds, checked {formatRelativeTime(brief.generatedAt)}. It is not official advice: confirm with your
        government and airline before you travel.
      </p>
    </section>
  );
}
