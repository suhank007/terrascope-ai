import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function WorkspaceFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("items-center justify-between px-1 text-xs text-muted", className)}>
      <p>Live public data · USGS · NASA FIRMS · Open-Meteo · adsb.fi</p>
      <p className="flex items-center gap-4">
        <a
          href="https://github.com/suhank007/terrascope-ai"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 transition-colors hover:text-foreground"
        >
          Source <ArrowUpRight className="h-3 w-3" />
        </a>
        <span>Built by Ankit Parihar</span>
      </p>
    </footer>
  );
}
