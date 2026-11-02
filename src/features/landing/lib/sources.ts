export interface DataSource {
  name: string;
  feeds: string;
  url: string;
}

/** Every public feed TerraScope reads, so the front page can say exactly where its claims come from. */
export const SOURCES: DataSource[] = [
  { name: "USGS", feeds: "Earthquakes", url: "https://earthquake.usgs.gov" },
  { name: "NASA FIRMS", feeds: "Wildfires", url: "https://firms.modaps.eosdis.nasa.gov" },
  { name: "NOAA Aviation Weather", feeds: "Airport METAR and TAF", url: "https://aviationweather.gov" },
  { name: "FAA", feeds: "US ground stops and delays", url: "https://nasstatus.faa.gov" },
  { name: "adsb.fi", feeds: "Live aircraft positions", url: "https://adsb.fi" },
  { name: "adsbdb", feeds: "Flight routes", url: "https://www.adsbdb.com" },
  { name: "Open-Meteo", feeds: "Weather and air quality", url: "https://open-meteo.com" },
  { name: "UK FCDO", feeds: "Travel advice", url: "https://www.gov.uk/foreign-travel-advice" },
  { name: "US State Dept", feeds: "Travel advisories", url: "https://travel.state.gov" },
  { name: "CDC", feeds: "Health notices", url: "https://wwwnc.cdc.gov/travel" },
  { name: "WHO", feeds: "Outbreak news", url: "https://www.who.int/emergencies/disease-outbreak-news" },
  { name: "Wikidata", feeds: "Top sights", url: "https://www.wikidata.org" },
  { name: "OurAirports", feeds: "Airport data", url: "https://ourairports.com" },
  { name: "ECB", feeds: "Exchange rates", url: "https://www.ecb.europa.eu" },
];
