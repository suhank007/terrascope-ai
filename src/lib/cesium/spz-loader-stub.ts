// Cesium's GltfSpzLoader (dead code for this app — we never load SPZ-format
// Gaussian Splat glTF models) statically imports @spz-loader/core, which
// embeds its WASM binary the same fragile way @cesium/wasm-splats does (see
// wasm-splats-stub.ts). Stubbed for the same reason via
// next.config.ts's turbopack.resolveAlias.
export function loadSpz(): never {
  throw new Error("SPZ loading is not supported in this build.");
}
