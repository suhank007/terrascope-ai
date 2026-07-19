// Cesium's Gaussian Splat sorter/texture-generator Workers (dead code for
// this app — we never render Gaussian Splats) statically import
// @cesium/wasm-splats, which embeds its WASM binary as a raw template
// literal string (the standard wasm-bindgen single-file pattern). Turbopack's
// minifier corrupts that literal into illegal octal escapes, breaking the
// whole chunk — and with it Cesium's init — even though this app never
// touches splats. See next.config.ts's turbopack.resolveAlias.
export function initSync() {}
export function radix_sort_gaussians_indexes() {}
export function generate_splat_texture() {}
