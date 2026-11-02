import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LinkItem {
  label: string;
  hint?: string;
  href: string;
  /** Opens another site: shows the arrow and uses a normal anchor. */
  external?: boolean;
}

/** Plain rows with a hairline between them, in place of a grid of bordered buttons. */
export function LinkList({ items, columns = 1, className }: { items: LinkItem[]; columns?: 1 | 2; className?: string }) {
  return (
    <ul className={cn("grid gap-x-10", columns === 2 && "md:grid-cols-2", className)}>
      {items.map((item) => {
        const body = (
          <>
            <span className="min-w-0">
              <span className="block text-sm text-foreground transition-colors group-hover:text-accent">{item.label}</span>
              {item.hint && <span className="block truncate text-xs text-muted">{item.hint}</span>}
            </span>
            {item.external ? (
              <ArrowUpRight className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-accent" aria-hidden />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-accent" aria-hidden />
            )}
          </>
        );
        const cls = "group flex min-h-12 items-center justify-between gap-4 border-b border-border/60 py-2";
        return (
          <li key={item.label + item.href}>
            {item.external ? (
              <a href={item.href} target="_blank" rel="noreferrer noopener" className={cls}>
                {body}
              </a>
            ) : (
              <Link href={item.href} className={cls}>
                {body}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
