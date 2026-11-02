"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface NavSection {
  id: string;
  label: string;
}

function jump(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}

/** Which section is nearest the top of the screen, so the nav can show where you are. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

/** "On this page": a sticky list on wide screens, a scrolling chip bar on phones. */
export function SectionNav({ sections }: { sections: NavSection[] }) {
  const active = useActiveSection(sections.map((s) => s.id));

  return (
    <>
      <nav aria-label="On this page" className="hidden lg:block">
        <div className="sticky top-6">
          <p className="mb-3 text-xs text-muted">On this page</p>
          <ul className="flex flex-col">
            {sections.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => jump(s.id)}
                  aria-current={active === s.id ? "location" : undefined}
                  className={cn(
                    "flex min-h-8 w-full items-center gap-2.5 text-left text-sm transition-colors",
                    active === s.id ? "text-foreground" : "text-muted hover:text-foreground"
                  )}
                >
                  <span className={cn("h-1 w-1 rounded-full transition-colors", active === s.id ? "bg-accent" : "bg-transparent")} aria-hidden />
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <nav aria-label="On this page" className="sticky top-0 z-20 -mx-4 border-b border-border bg-background px-4 sm:-mx-6 sm:px-6 lg:hidden">
        <ul className="flex gap-1 overflow-x-auto py-2 [scrollbar-width:none]">
          {sections.map((s) => (
            <li key={s.id} className="shrink-0">
              <button
                type="button"
                onClick={() => jump(s.id)}
                aria-current={active === s.id ? "location" : undefined}
                className={cn("h-9 rounded-full px-3.5 text-sm transition-colors", active === s.id ? "bg-surface-elevated text-foreground" : "text-muted hover:text-foreground")}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
