import { Info } from "lucide-react";
import { SEVERITY } from "@/features/trip/components/severity";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { flagEmoji } from "../lib/format";
import type { AirportBrief } from "../types";

/** The one filled surface on an airport page: is it running normally, and why. */
export function OutlookBanner({ brief }: { brief: AirportBrief }) {
  const { airport, outlook } = brief;
  const style = SEVERITY[outlook.level];

  return (
    <section aria-labelledby="outlook-heading" className={cn("rounded-2xl border p-6", style.bg, style.border)}>
      <p className="text-sm text-muted">
        <span aria-hidden>{flagEmoji(airport.countryCode)}</span> {airport.city} · {airport.icao}
      </p>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="font-mono text-3xl font-semibold tracking-tight text-foreground">{airport.iata}</span>
        <span className="text-base text-foreground">{airport.name}</span>
      </div>

      <h2 id="outlook-heading" className="mt-5 flex items-center gap-3 text-xl font-semibold text-foreground">
        <style.icon className={cn("h-5 w-5 shrink-0", style.text)} aria-hidden />
        {outlook.headline}
      </h2>

      {outlook.reasons.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2.5">
          {outlook.reasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", SEVERITY[reason.severity].dot)} aria-hidden />
              <span className="text-foreground">
                <span className="sr-only">{SEVERITY[reason.severity].label}: </span>
                {reason.text} <span className="whitespace-nowrap text-muted">{reason.source}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {outlook.unchecked.length > 0 && (
        <p role="status" className="mt-4 flex items-start gap-2 text-sm text-alert">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Couldn&apos;t check: {outlook.unchecked.join(", ")}. This outlook may be incomplete.
        </p>
      )}

      <p className="mt-5 max-w-prose text-xs leading-relaxed text-muted">
        {outlook.basis === "faa-and-weather"
          ? "Built from the FAA's live delay programmes and the airport's weather reports and forecast."
          : "Built from weather only. Outside the US there is no free public delay feed, so this can't see air traffic control restrictions or airline delays."}{" "}
        Checked {formatRelativeTime(brief.generatedAt)}. Confirm your own flight with your airline.
      </p>
    </section>
  );
}
