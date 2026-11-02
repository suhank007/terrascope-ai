import { Facts } from "@/components/ui/facts";
import type { TripBrief } from "../types";
import { TripCard } from "./trip-card";

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
    <TripCard id="essentials" title="Essentials" className={className}>
      <Facts
        columns={2}
        items={[
          {
            label: "Currency",
            value: country.currencyCode ? `${country.currencyCode}${country.currencySymbol ? ` (${country.currencySymbol})` : ""}` : "Varies",
            note:
              country.currencyCode && currency.status === "ok"
                ? currency.data.code === currency.data.home
                  ? "Same as your home currency"
                  : describeRate(currency.data.home, currency.data.code, currency.data.rate)
                : country.currencyCode && currency.status === "unavailable"
                  ? currency.reason
                  : undefined,
          },
          { label: "Local time", value: time || "Not available" },
          { label: "Languages", value: country.languages.slice(0, 3).join(", ") || "Not available" },
          { label: "Calling code", value: country.callingCode ?? "Not available" },
          { label: "Drives on the", value: country.drivesOn },
          { label: "Capital", value: country.capital ?? "Not available" },
        ]}
      />
      {currency.status === "ok" && currency.data.date && currency.data.code !== currency.data.home && (
        <p className="mt-3 text-xs text-muted">Reference rate from the European Central Bank, {currency.data.date}. Bank and card rates differ.</p>
      )}
    </TripCard>
  );
}
