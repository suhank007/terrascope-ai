const ROWS: { ask: string; why: string; instead: string }[] = [
  { ask: "Is my flight late?", why: "Delays need airline schedules, which come from a paid data source.", instead: "We show where it is now, plus FAA delay programmes for US airports." },
  { ask: "Hotel prices and availability", why: "Booking and Airbnb don't offer open data, and scraping breaks their terms.", instead: "Search links that open on their own sites, with your dates filled in." },
  { ask: "Ratings and reviews", why: "TripAdvisor and similar need a paid or partner licence.", instead: "Top sights ranked by Wikipedia coverage, labelled as fame, not quality." },
  { ask: "Live road traffic to the airport", why: "Traffic-aware routing is a paid API.", instead: "Ride and transit links from the airport page." },
  { ask: "Transit and rail tickets", why: "There is no global ticketing API.", instead: "Rome2rio and an OpenStreetMap transit map." },
  { ask: "Alerts on your phone or watch", why: "They need a native app or a messaging service, and this is a web app.", instead: "Not available yet." },
];

export function Limits() {
  return (
    <section id="limits" aria-labelledby="limits-title" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20">
      <h2 id="limits-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
        What it doesn&apos;t know yet
      </h2>
      <p className="mt-1 max-w-2xl text-base text-muted">Built on free public data, so some things stay out of reach. Here is each one, why, and what to use instead.</p>

      <div className="mt-8 hidden grid-cols-[1.1fr_1.4fr_1.4fr] gap-8 border-b border-border pb-3 text-sm font-medium text-muted md:grid">
        <span>You might ask</span>
        <span>Why it&apos;s missing</span>
        <span>What you get instead</span>
      </div>
      <ul>
        {ROWS.map((r) => (
          <li key={r.ask} className="grid gap-1 border-b border-border py-5 md:grid-cols-[1.1fr_1.4fr_1.4fr] md:gap-8">
            <p className="text-base font-semibold">{r.ask}</p>
            <p className="text-base leading-relaxed text-muted">{r.why}</p>
            <p className="text-base leading-relaxed text-foreground">{r.instead}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
