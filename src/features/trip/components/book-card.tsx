import { ExternalLink, Ticket } from "lucide-react";
import { OFFICIAL_RULE_LINKS, orderLinkGroups } from "../lib/link-order";
import type { TravelMode, TripBrief } from "../types";
import { TripCard } from "./trip-card";

export function BookCard({ brief, mode, className }: { brief: TripBrief; mode: TravelMode; className?: string }) {
  const groups = orderLinkGroups(brief.links, mode);

  return (
    <TripCard id="book" icon={Ticket} title="Plan and book" className={className}>
      <div className="flex flex-col gap-4">
        {groups.map((group) => (
          <div key={group.group}>
            <p className="mb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted">{group.label}</p>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {group.links.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex min-h-11 items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2 transition-colors hover:border-accent/40"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">{link.label}</span>
                      <span className="block truncate text-xs text-muted">{link.hint}</span>
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted group-hover:text-accent" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Each link opens the provider&apos;s own search for this trip. TerraScope doesn&apos;t earn from them yet, and you book and pay on their site.
      </p>
    </TripCard>
  );
}

export function BeforeYouFlyCard({ className }: { className?: string }) {
  return (
    <TripCard id="before-fly" icon={Ticket} title="Before you fly" className={className}>
      <p className="text-sm leading-relaxed text-muted">
        What you can carry (liquids, batteries, alcohol and duty-free) depends on your airline, your route and where you land. Rules also
        change, so check the official pages for your departure point, and your airline&apos;s own policy.
      </p>
      <ul className="mt-3 flex flex-col gap-1.5">
        {OFFICIAL_RULE_LINKS.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex min-h-11 items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2 transition-colors hover:border-accent/40"
            >
              <span>
                <span className="block text-sm font-medium text-foreground">{link.label}</span>
                <span className="block text-xs text-muted">{link.hint}</span>
              </span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted group-hover:text-accent" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </TripCard>
  );
}
