import { Checks } from "./checks";
import { Destinations } from "./destinations";
import { Hero } from "./hero";
import { LandingFooter } from "./landing-footer";
import { LandingNav } from "./landing-nav";
import { Limits } from "./limits";
import { LiveBoard } from "./live-board";

/** The front page: white, photographic at the top, plain everywhere else. */
export function Landing() {
  return (
    <div className="h-dvh scroll-smooth scroll-pt-20 overflow-y-auto overflow-x-hidden bg-background text-foreground">
      <a href="#main" className="sr-only z-[60] rounded-full bg-accent px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <LandingNav />
      <main id="main">
        <Hero />
        <LiveBoard />
        <Destinations />
        <Checks />
        <Limits />
      </main>
      <LandingFooter />
    </div>
  );
}
