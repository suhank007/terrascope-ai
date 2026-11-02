import { Capabilities } from "./capabilities";
import { Cta } from "./cta";
import { Hero } from "./hero";
import { LandingFooter } from "./landing-footer";
import { LandingNav } from "./landing-nav";
import { Limits } from "./limits";
import { Pipeline } from "./pipeline";
import { PrincipleBanner } from "./principle-banner";
import { Showcase } from "./showcase";
import { SourcesStrip } from "./sources-strip";

/** The front page. Red noir: black ground, red for alerts, teal for all-clear. */
export function Landing() {
  return (
    <div className="noir h-dvh scroll-smooth overflow-y-auto overflow-x-hidden bg-noir-ink text-white">
      <a href="#main" className="sr-only z-[60] rounded-full bg-white px-4 py-2 text-sm font-medium text-black focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>

      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-noir-deep to-noir-ink" />
        <div className="noir-stars-a" />
        <div className="noir-stars-b" />
        <div className="absolute left-1/2 top-1/3 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-noir/[0.07] blur-[120px]" />
        <div className="noir-grid absolute inset-0" />
      </div>

      <LandingNav />
      <main id="main" className="relative z-10">
        <Hero />
        <SourcesStrip />
        <Showcase />
        <Pipeline />
        <Capabilities />
        <PrincipleBanner />
        <Limits />
        <Cta />
      </main>
      <LandingFooter />
    </div>
  );
}
