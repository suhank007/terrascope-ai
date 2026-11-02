import { CloudSun } from "lucide-react";
import { ForecastStrip } from "@/features/trip/components/conditions-card";
import { SEVERITY } from "@/features/trip/components/severity";
import { TripCard, Unavailable } from "@/features/trip/components/trip-card";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CATEGORY_INFO, describeCeiling, describeVisibility, describeWind, summarizeWeather } from "../lib/format";
import type { AirportBrief, FlightCategory } from "../types";

function CategoryChip({ category }: { category: FlightCategory }) {
  const info = CATEGORY_INFO[category];
  const style = SEVERITY[info.tone];
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-xs font-semibold", style.bg, style.border, style.text)} title={info.meaning}>
      {info.label}
    </span>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{children}</dd>
    </div>
  );
}

export function AirportConditionsCard({ brief, className }: { brief: AirportBrief; className?: string }) {
  const { metar, taf, forecast } = brief;

  return (
    <TripCard id="airport-conditions" icon={CloudSun} title="Conditions now" className={className}>
      <div className="flex flex-col gap-5">
        {metar.status === "ok" ? (
          <>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {metar.data.flightCategory && <CategoryChip category={metar.data.flightCategory} />}
              <span className="text-sm text-muted">{metar.data.flightCategory ? CATEGORY_INFO[metar.data.flightCategory].meaning : "Flight category unknown."}</span>
            </div>

            <dl className="grid grid-cols-2 gap-2.5">
              <Fact label="Wind">{describeWind(metar.data.windDir, metar.data.windKt, metar.data.gustKt)}</Fact>
              <Fact label="Visibility">{describeVisibility(metar.data.visibilitySm)}</Fact>
              <Fact label="Cloud ceiling">{describeCeiling(metar.data.ceilingFt)}</Fact>
              <Fact label="Temperature">{metar.data.tempC !== null ? `${Math.round(metar.data.tempC)}°C` : "—"}</Fact>
            </dl>

            {metar.data.weather.length > 0 && (
              <p className="text-sm text-foreground">
                <span className="text-muted">Right now: </span>
                {metar.data.weather.join(", ")}
              </p>
            )}
            <p className="text-xs text-muted">Reported {formatRelativeTime(metar.data.observedAt)}</p>
          </>
        ) : (
          <Unavailable reason={metar.reason} />
        )}

        {taf.status === "ok" ? (
          <div className="border-t border-border pt-4">
            <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted">Next {taf.data.hours} hours (TAF)</p>
            <p className="text-sm leading-relaxed text-foreground">
              {taf.data.worstCategory ? (
                <>
                  Worst expected: <CategoryChip category={taf.data.worstCategory} />
                  {taf.data.worstIsTemporary ? " at times" : ""}.{" "}
                </>
              ) : null}
              {taf.data.thunderstorm ? "Thunderstorms possible. " : ""}
              {taf.data.maxGustKt ? `Gusts up to ${taf.data.maxGustKt} kt. ` : ""}
              {taf.data.weather.length > 0 ? `Expect ${summarizeWeather(taf.data.weather).join(", ")}.` : ""}
            </p>
          </div>
        ) : (
          <p className="border-t border-border pt-4 text-sm text-muted">{taf.reason}</p>
        )}

        <div className="border-t border-border pt-4">
          <ForecastStrip section={forecast} />
        </div>

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
