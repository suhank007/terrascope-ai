import { ShieldCheck } from "lucide-react";
import { formatNoticeDate } from "../lib/dates";
import type { AdvisoriesData, Section, TripBrief } from "../types";
import { SeverityPill, SourceLink, TripCard, Unavailable } from "./trip-card";

function Row({ source, children }: { source: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border py-3 first:border-t-0 first:pt-0 last:pb-0">
      <p className="mb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted">{source}</p>
      {children}
    </div>
  );
}

function Body({ data, country }: { data: AdvisoriesData; country: string }) {
  const { uk, us, missing } = data;
  return (
    <div>
      <Row source="UK Foreign Office">
        {uk ? (
          <div className="flex flex-col gap-2">
            <SeverityPill severity={uk.severity}>
              {uk.severity === "none" ? "No warning" : uk.partial ? "Warning for parts of the country" : "Warning for the whole country"}
            </SeverityPill>
            <p className="text-sm leading-relaxed text-foreground/90">{uk.summary}</p>
            <p className="flex items-center gap-3">
              <SourceLink href={uk.url}>Full FCDO advice</SourceLink>
              {uk.updatedAt && <span className="text-xs text-muted">Updated {formatNoticeDate(uk.updatedAt)}</span>}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">{missing?.includes("UK FCDO") ? "The FCDO couldn't be reached." : `The FCDO has no page for ${country}.`}</p>
        )}
      </Row>
      <Row source="US State Department">
        {us ? (
          <div className="flex flex-col gap-2">
            <SeverityPill severity={us.severity}>
              Level {us.level}: {us.label}
            </SeverityPill>
            <p className="flex items-center gap-3">
              <SourceLink href={us.url}>Full State Dept advisory</SourceLink>
              {us.updatedAt && <span className="text-xs text-muted">Updated {formatNoticeDate(us.updatedAt)}</span>}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">{missing?.includes("US State Dept") ? "The State Department feed couldn't be reached." : `No State Department advisory is listed for ${country}.`}</p>
        )}
      </Row>
    </div>
  );
}

export function SafetyCard({ brief, className }: { brief: TripBrief; className?: string }) {
  const section: Section<AdvisoriesData> = brief.advisories;
  return (
    <TripCard id="safety" icon={ShieldCheck} title="Safety and entry" className={className}>
      {section.status === "ok" ? <Body data={section.data} country={brief.destination.countryName} /> : <Unavailable reason={section.reason} />}
    </TripCard>
  );
}
