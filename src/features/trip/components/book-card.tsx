import { Art } from "@/components/ui/art";
import { LinkList } from "@/components/ui/link-list";
import { OFFICIAL_RULE_LINKS, orderLinkGroups } from "../lib/link-order";
import type { TravelMode, TripBrief } from "../types";
import { TripCard } from "./trip-card";

export function BookCard({ brief, mode, className }: { brief: TripBrief; mode: TravelMode; className?: string }) {
  const groups = orderLinkGroups(brief.links, mode);

  return (
    <TripCard id="book" title="Plan and book" className={className}>
      <div className="mb-6 flex items-center gap-4">
        <Art kind="hotel" size={72} />
        <p className="max-w-prose text-xs leading-relaxed text-muted">
          Each link opens the provider&apos;s own search for this trip. TerraScope doesn&apos;t earn from them yet, and you book and pay on their site.
        </p>
      </div>
      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <div key={group.group}>
            <h3 className="text-sm font-medium text-foreground">{group.label}</h3>
            <LinkList columns={2} className="mt-1" items={group.links.map((l) => ({ label: l.label, hint: l.hint, href: l.url, external: true }))} />
          </div>
        ))}
      </div>
    </TripCard>
  );
}

export function BeforeYouFlyCard({ className }: { className?: string }) {
  return (
    <TripCard id="before-fly" title="Before you fly" className={className}>
      <p className="max-w-prose text-sm leading-relaxed text-muted">
        What you can carry (liquids, batteries, alcohol and duty-free) depends on your airline, your route and where you land, and the rules change.
        Check the official pages for your departure point, and your airline&apos;s own policy.
      </p>
      <LinkList columns={2} className="mt-3" items={OFFICIAL_RULE_LINKS.map((l) => ({ label: l.label, hint: l.hint, href: l.url, external: true }))} />
    </TripCard>
  );
}
