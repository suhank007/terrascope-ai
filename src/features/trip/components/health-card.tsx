import { formatNoticeDate } from "../lib/dates";
import type { TripBrief } from "../types";
import { SeverityPill, SourceLink, TripCard, Unavailable } from "./trip-card";

export function HealthCard({ brief, className }: { brief: TripBrief; className?: string }) {
  const { health, destination } = brief;

  return (
    <TripCard id="health" title="Health" className={className}>
      {health.status === "unavailable" ? (
        <Unavailable reason={health.reason} />
      ) : (
        <div className="flex flex-col gap-5">
          {health.data.notices.length === 0 && health.data.outbreaks.length === 0 ? (
            <p className="max-w-prose text-sm leading-relaxed text-muted">
              No current CDC travel notices or WHO outbreak reports mention {destination.countryName}. Routine vaccines and your own doctor&apos;s advice still apply.
            </p>
          ) : (
            <>
              {health.data.notices.length > 0 && (
                <ul>
                  {health.data.notices.map((notice) => (
                    <li key={notice.url} className="border-t border-border/60 py-4 first:border-t-0 first:pt-0">
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="text-sm font-medium text-foreground">{notice.title}</h3>
                        <SeverityPill severity={notice.severity}>CDC level {notice.level}</SeverityPill>
                      </div>
                      {notice.summary && <p className="mt-1.5 line-clamp-3 max-w-prose text-sm leading-relaxed text-muted">{notice.summary}</p>}
                      <p className="mt-2 flex items-center gap-4">
                        <SourceLink href={notice.url}>CDC notice</SourceLink>
                        {notice.date && <span className="text-xs text-muted">{formatNoticeDate(notice.date)}</span>}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              {health.data.outbreaks.length > 0 && (
                <div>
                  <h3 className="mb-1 text-sm font-medium text-foreground">WHO outbreak news</h3>
                  <ul>
                    {health.data.outbreaks.map((outbreak) => (
                      <li key={outbreak.url} className="border-t border-border/60 py-3 first:border-t-0">
                        <p className="text-sm text-foreground">{outbreak.title}</p>
                        <p className="mt-1 flex items-center gap-4">
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
            <p role="status" className="text-sm text-alert">
              {health.data.missing.join(" and ")} couldn&apos;t be reached, so this list may be incomplete.
            </p>
          )}
        </div>
      )}
    </TripCard>
  );
}
