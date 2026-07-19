// CARTO's free Voyager basemap, not plain OpenStreetMap tiles — same data,
// same no-API-key/no-account requirement, but labels render in English
// (technically "name:en" where available) instead of each place's local
// script. Verified visually: standard OSM tiles over Beijing/Riyadh show
// Chinese/Arabic place names; these show "Beijing"/"Riyadh". Subdomains
// a-d exist purely for browser request parallelism.
export const BASEMAP_TILE_URL_TEMPLATE = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png";
export const BASEMAP_SUBDOMAINS = ["a", "b", "c", "d"];
export const BASEMAP_CREDIT = "© OpenStreetMap contributors © CARTO";

/** Camera height (meters) below which flight/close-zoom layers activate. */
export const CLOSE_ZOOM_HEIGHT_THRESHOLD = 6_000_000;

/** Debounce (ms) applied to camera moveEnd before broadcasting new bounds. */
export const CAMERA_DEBOUNCE_MS = 500;
