import { Facts } from "@/components/ui/facts";
import { ForecastStrip } from "@/features/trip/components/conditions-card";
import { SEVERITY } from "@/features/trip/components/severity";
import { TripCard, Unavailable } from "@/features/trip/components/trip-card";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CATEGORY_INFO, describeCeiling, describeVisibility, describeWind, summarizeWeather } from "../lib/format";
import type { AirportBrief, FlightCategory } from "../types";

function Category({ category }: { category: FlightCategory }) {
  const info = CATEGORY_INFO[category];
  const style = SEVERITY[info.tone];
  return (
    <span className="inline-flex items-center gap-2" title={info.meaning}>
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} aria-hidden />
      <span className={cn("font-mono text-sm font-semibold", style.text)}>{info.label}</span>
    </span>
  );
}

export function AirportConditionsCard({ brief, className }: { brief: AirportBrief; className?: string }) {
  const { metar, taf, forecast } = brief;

  return (
    <TripCard id="airport-conditions" title="Conditions" className={className}>
      <div className="flex flex-col gap-6">
        {metar.status === "ok" ? (
          <div>
            <p className="flex flex-wrap items-center gap-x-3 text-sm">
              {metar.data.flightCategory && <Category category={metar.data.flightCategory} />}
              <span className="text-muted">{metar.data.flightCategory ? CATEGORY_INFO[metar.data.flightCategory].meaning : "Flight category unknown."}</span>
            </p>
            <Facts
              className="mt-2"
              columns={2}
              items={[
                { label: "Wind", value: describeWind(metar.data.windDir, metar.data.windKt, metar.data.gustKt) },
                { label: "Visibility", value: describeVisibility(metar.data.visibilitySm) },
                { label: "Cloud ceiling", value: describeCeiling(metar.data.ceilingFt) },
                { label: "Temperature", value: metar.data.tempC !== null ? `${Math.round(metar.data.tempC)}°C` : "Not reported" },
              ]}
            />
            <p className="mt-3 text-xs text-muted">
              {metar.data.weather.length > 0 ? `Right now: ${metar.data.weather.join(", ")}. ` : ""}Reported {formatRelativeTime(metar.data.observedAt)}.
            </p>
          </div>
        ) : (
          <Unavailable reason={metar.reason} />
        )}

        {taf.status === "ok" ? (
          <div>
            <h3 className="text-sm font-medium text-foreground">Next {taf.data.hours} hours</h3>
            <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted">
              {taf.data.worstCategory ? (
                <>
                  Worst expected <Category category={taf.data.worstCategory} />
                  {taf.data.worstIsTemporary ? ", at times" : ""}.{" "}
                </>
              ) : null}
              {taf.data.thunderstorm ? "Thunderstorms possible. " : ""}
              {taf.data.maxGustKt ? `Gusts up to ${taf.data.maxGustKt} kt. ` : ""}
              {taf.data.weather.length > 0 ? `Expect ${summarizeWeather(taf.data.weather).join(", ")}.` : ""}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">{taf.reason}</p>
        )}

        <ForecastStrip section={forecast} />

        {(metar.status === "ok" || taf.status === "ok") && (
          <details className="text-xs text-muted">
            <summary className="cursor-pointer select-none py-1 hover:text-foreground">Raw METAR and TAF</summary>
            {metar.status === "ok" && <p className="mt-2 break-words font-mono leading-relaxed">{metar.data.raw}</p>}
            {taf.status === "ok" && <p className="mt-2 break-words font-mono leading-relaxed">{taf.data.raw}</p>}
          </details>
        )}
      </div>
    </TripCard>
  );
}
