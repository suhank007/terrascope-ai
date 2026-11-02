import { HeartPulse } from "lucide-react";
import { formatNoticeDate } from "../lib/dates";
import type { TripBrief } from "../types";
import { SeverityPill, SourceLink, TripCard, Unavailable } from "./trip-card";

export function HealthCard({ brief, className }: { brief: TripBrief; className?: string }) {
  const { health, destination } = brief;

  return (
    <TripCard id="health" icon={HeartPulse} title="Health" className={className}>
      {health.status === "unavailable" ? (
        <Unavailable reason={health.reason} />
      ) : (
        <div className="flex flex-col gap-4">
          {health.data.notices.length === 0 && health.data.outbreaks.length === 0 ? (
            <p className="text-sm text-muted">
              No current CDC travel notices or WHO outbreak reports mention {destination.countryName}. Routine vaccines and your own
              doctor&apos;s advice still apply.
            </p>
          ) : (
            <>
              {health.data.notices.length > 0 && (
                <ul className="flex flex-col gap-3">
                  {health.data.notices.map((notice) => (
                    <li key={notice.url} className="flex flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <SeverityPill severity={notice.severity}>CDC Level {notice.level}</SeverityPill>
                        <span className="text-sm font-medium text-foreground">{notice.title}</span>
                      </div>
                      {notice.summary && <p className="line-clamp-3 text-sm leading-relaxed text-muted">{notice.summary}</p>}
                      <p className="flex items-center gap-3">
                        <SourceLink href={notice.url}>CDC notice</SourceLink>
                        {notice.date && <span className="text-xs text-muted">{formatNoticeDate(notice.date)}</span>}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              {health.data.outbreaks.length > 0 && (
                <div>
                  <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted">WHO outbreak news</p>
                  <ul className="flex flex-col gap-2">
                    {health.data.outbreaks.map((outbreak) => (
                      <li key={outbreak.url} className="flex flex-col gap-0.5">
                        <span className="text-sm text-foreground">{outbreak.title}</span>
                        <p className="flex items-center gap-3">
                          <SourceLink href={outbreak.url}>WHO report</SourceLink>
                          <span className="text-xs text-muted">{formatNoticeDate(outbreak.date)}</span>
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
          {health.data.missing && (
            <p role="status" className="text-xs text-alert">
              {health.data.missing.join(" and ")} couldn&apos;t be reached, so this list may be incomplete.
            </p>
          )}
        </div>
      )}
    </TripCard>
  );
}
