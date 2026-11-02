import { Banknote } from "lucide-react";
import type { TripBrief } from "../types";
import { TripCard } from "./trip-card";

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{children}</dd>
    </div>
  );
}

function localTime(timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit", timeZone: timezone }).format(new Date());
  } catch {
    return "";
  }
}

function formatAmount(value: number): string {
  return value >= 100 ? value.toFixed(0) : value >= 10 ? value.toFixed(1) : value.toFixed(value >= 1 ? 2 : 4);
}

/** "1 USD = 0.0094 EUR" is hard to use; below 0.1 it reads better flipped. */
export function describeRate(home: string, code: string, rate: number): string {
  return rate < 0.1 ? `1 ${code} = ${formatAmount(1 / rate)} ${home}` : `1 ${home} = ${formatAmount(rate)} ${code}`;
}

export function EssentialsCard({ brief, className }: { brief: TripBrief; className?: string }) {
  const { country, currency, forecast } = brief;
  const time = forecast.status === "ok" ? localTime(forecast.data.timezone) : "";

  return (
    <TripCard id="essentials" icon={Banknote} title="Essentials" className={className}>
      <dl className="grid grid-cols-2 gap-2.5">
        <Fact label="Currency">
          {country.currencyCode ? (
            <>
              {country.currencyCode}
              {country.currencySymbol ? ` (${country.currencySymbol})` : ""}
              <span className="mt-0.5 block text-xs font-normal text-muted">
                {currency.status === "ok"
                  ? currency.data.code === currency.data.home
                    ? "Same as your home currency"
                    : describeRate(currency.data.home, currency.data.code, currency.data.rate)
                  : currency.reason}
              </span>
            </>
          ) : (
            "Varies"
          )}
        </Fact>
        <Fact label="Local time">{time || "—"}</Fact>
        <Fact label="Languages">{country.languages.slice(0, 3).join(", ") || "—"}</Fact>
        <Fact label="Calling code">{country.callingCode ?? "—"}</Fact>
        <Fact label="Drives on the">{country.drivesOn}</Fact>
        <Fact label="Capital">{country.capital ?? "—"}</Fact>
      </dl>
      {currency.status === "ok" && currency.data.date && (
        <p className="mt-3 text-xs text-muted">Reference rate from the European Central Bank, {currency.data.date}. Bank and card rates differ.</p>
      )}
    </TripCard>
  );
}
