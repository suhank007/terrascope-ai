"use client";

import { ArrowLeft } from "lucide-react";
import { EntityDetailContent, panelHeader } from "@/features/side-panel/components/entity-side-panel";
import type { SelectedEntity } from "@/features/side-panel/types";

/** A selected signal's detail, with a clear way back to the list. Shared by
 *  the desktop right dock and the mobile bottom sheet. */
export function EntityDetailView({ selected, onBack }: { selected: SelectedEntity; onBack: () => void }) {
  const header = panelHeader(selected);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b border-border px-5 py-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to signal list"
          title="Back (Esc)"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-elevated hover:text-foreground active:scale-90 xl:h-8 xl:w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background/40 text-accent">
          <header.icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted">{header.subtitle}</p>
          <h2 className="truncate text-sm font-medium text-foreground">{header.title}</h2>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <EntityDetailContent selected={selected} />
      </div>
    </div>
  );
}
