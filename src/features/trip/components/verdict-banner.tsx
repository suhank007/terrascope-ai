import { Info } from "lucide-react";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TripBrief } from "../types";
import { SEVERITY } from "./severity";

/** The one filled surface on the page: the answer to "is this trip OK?", with the reasons behind it. */
export function VerdictBanner({ brief }: { brief: TripBrief }) {
  const { verdict, destination, country } = brief;
  const style = SEVERITY[verdict.level];

  return (
    <section aria-labelledby="verdict-heading" className={cn("rounded-2xl border p-6", style.bg, style.border)}>
      <p className="text-sm text-muted">
        <span aria-hidden>{country.flag}</span> {destination.name}, {destination.countryName}
      </p>
      <h2 id="verdict-heading" className="mt-2 flex items-center gap-3 text-xl font-semibold text-foreground">
        <style.icon className={cn("h-5 w-5 shrink-0", style.text)} aria-hidden />
        {verdict.headline}
      </h2>

      {verdict.reasons.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2.5">
          {verdict.reasons.map((reason, i) => (
            <li key={`${reason.source}-${i}`} className="flex items-start gap-3 text-sm">
              <span className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", SEVERITY[reason.severity].dot)} aria-hidden />
              <span className="text-foreground">
                <span className="sr-only">{SEVERITY[reason.severity].label}: </span>
                {reason.text}{" "}
                {reason.url ? (
                  <a href={reason.url} target="_blank" rel="noreferrer noopener" className="whitespace-nowrap text-muted underline-offset-2 hover:text-accent hover:underline">
                    {reason.source} ↗
                  </a>
                ) : (
                  <span className="whitespace-nowrap text-muted">{reason.source}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      {verdict.reasons.length === 0 && verdict.unchecked.length === 0 && (
        <p className="mt-3 text-sm text-muted">Nothing in the advisories, health notices, live hazards or forecast raised a flag.</p>
      )}

      {verdict.unchecked.length > 0 && (
        <p role="status" className="mt-4 flex items-start gap-2 text-sm text-alert">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Couldn&apos;t check: {verdict.unchecked.join(", ")}. This summary may be incomplete.
        </p>
      )}

      <p className="mt-5 text-xs leading-relaxed text-muted">
        Summarised from public feeds, checked {formatRelativeTime(brief.generatedAt)}. Not official advice: confirm with your government and airline.
      </p>
    </section>
  );
}
