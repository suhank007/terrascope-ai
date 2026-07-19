export const OSM_TILE_URL = "https://tile.openstreetmap.org/";

/** Camera height (meters) below which flight/close-zoom layers activate. */
export const CLOSE_ZOOM_HEIGHT_THRESHOLD = 6_000_000;

/** Debounce (ms) applied to camera moveEnd before broadcasting new bounds. */
export const CAMERA_DEBOUNCE_MS = 500;
