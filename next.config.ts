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
  },
};

export default nextConfig;
