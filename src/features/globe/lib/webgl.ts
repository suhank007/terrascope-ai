let cached: boolean | undefined;

/** Whether this browser can create a WebGL context at all. Cached: it creates a canvas, and React may ask more than once. */
export function hasWebGL(): boolean {
  if (cached !== undefined) return cached;
  try {
    const canvas = document.createElement("canvas");
    cached = !!(canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    cached = false;
  }
  return cached;
}
