// Esri World Street Map: keyless, English-labelled basemap. CARTO's free
// Voyager tiles used to fill this role, but CARTO now serves a "API KEY
// REQUIRED" watermark tile to unauthenticated clients. Note Esri's tile URL
// order is {z}/{y}/{x}, and there are no subdomains to rotate across.
export const BASEMAP_TILE_URL_TEMPLATE =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
export const BASEMAP_CREDIT = "Tiles © Esri — Source: Esri, DeLorme, NAVTEQ, USGS, and the GIS User Community";

/** Camera height (meters) below which flight/close-zoom layers activate. */
export const CLOSE_ZOOM_HEIGHT_THRESHOLD = 6_000_000;

/** Debounce (ms) applied to camera moveEnd before broadcasting new bounds. */
export const CAMERA_DEBOUNCE_MS = 500;
