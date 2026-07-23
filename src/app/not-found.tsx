import Link from "next/link";
import { Globe2 } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex h-dvh w-dvw flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="animate-fade-in flex flex-col items-center gap-6">
        <div className="glass-panel flex h-16 w-16 items-center justify-center rounded-2xl">
          <Globe2 className="h-7 w-7 text-accent" />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Error 404</p>
          <h1 className="text-xl font-semibold text-foreground">This coordinate doesn&apos;t exist</h1>
          <p className="max-w-sm text-sm text-muted">
            The page you&apos;re looking for isn&apos;t on the map. Head back to the globe.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background transition hover:bg-accent-strong active:scale-95"
        >
          Back to TerraScope AI
        </Link>
      </div>
    </main>
  );
}
