import { formatNoticeDate } from "../lib/dates";
import type { AdvisoriesData, TripBrief } from "../types";
import { SeverityPill, SourceLink, TripCard, Unavailable } from "./trip-card";

function Source({ name, status, children }: { name: string; status?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border-t border-border/60 py-4 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-medium text-foreground">{name}</h3>
        {status}
      </div>
      <div className="mt-2 flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Body({ data, country }: { data: AdvisoriesData; country: string }) {
  const { uk, us, missing } = data;
  return (
    <div>
      <Source name="UK Foreign Office" status={uk && <SeverityPill severity={uk.severity}>{uk.severity === "none" ? "No warning" : uk.partial ? "Parts of the country" : "Whole country"}</SeverityPill>}>
        {uk ? (
          <>
            <p className="max-w-prose text-sm leading-relaxed text-muted">{uk.summary}</p>
            <p className="flex items-center gap-4">
              <SourceLink href={uk.url}>Full advice</SourceLink>
              {uk.updatedAt && <span className="text-xs text-muted">Updated {formatNoticeDate(uk.updatedAt)}</span>}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted">{missing?.includes("UK FCDO") ? "The FCDO couldn't be reached." : `The FCDO has no page for ${country}.`}</p>
        )}
      </Source>

      <Source name="US State Department" status={us && <SeverityPill severity={us.severity}>Level {us.level}: {us.label}</SeverityPill>}>
        {us ? (
          <p className="flex items-center gap-4">
            <SourceLink href={us.url}>Full advisory</SourceLink>
            {us.updatedAt && <span className="text-xs text-muted">Updated {formatNoticeDate(us.updatedAt)}</span>}
          </p>
        ) : (
          <p className="text-sm text-muted">{missing?.includes("US State Dept") ? "The State Department feed couldn't be reached." : `No State Department advisory is listed for ${country}.`}</p>
        )}
      </Source>
    </div>
  );
}

export function SafetyCard({ brief, className }: { brief: TripBrief; className?: string }) {
  const section = brief.advisories;
  return (
    <TripCard id="safety" title="Safety and entry" className={className}>
      {section.status === "ok" ? <Body data={section.data} country={brief.destination.countryName} /> : <Unavailable reason={section.reason} />}
    </TripCard>
  );
}
