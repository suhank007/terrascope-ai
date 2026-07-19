import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // React Strict Mode double-mounts every component once in dev to catch
  // missing effect cleanup. Cesium's <Viewer> creates a real WebGL context
  // in that mount effect — the double mount/unmount/remount cycle can leave
  // two live render loops fighting over the canvas, which reads as
  // continuous flicker rather than a one-time flash. Disabled for that
  // reason; safe to re-enable once Cesium is no longer in the tree.
  reactStrictMode: false,
  turbopack: {
    root: path.join(__dirname),
    // Cesium's barrel export pulls in a few features this app never uses
    // (KML/KMZ, Gaussian Splats, SPZ glTF models). Each depends on a
    // package that embeds a WASM binary directly in its JS as a template
    // literal (the standard wasm-bindgen/Emscripten "single file" pattern —
    // @zip.js/zip.js's zlib worker, @cesium/wasm-splats, @spz-loader/core).
    // Turbopack's production minifier corrupts those literals into illegal
    // octal escapes ("Octal escape sequences are not allowed in template
    // strings"), which breaks the whole chunk — and with it Cesium's init —
    // even though none of these features are ever used. Aliasing each one
    // to a no-op stub means Turbopack never traces into the broken path.
    resolveAlias: {
      "@zip.js/zip.js/lib/zip-core.js": "./src/lib/cesium/zip-core-stub.ts",
      "@cesium/wasm-splats": "./src/lib/cesium/wasm-splats-stub.ts",
      "@spz-loader/core": "./src/lib/cesium/spz-loader-stub.ts",
    },
  },
};

export default nextConfig;
