// Cesium's KmlDataSource/exportKml (unused by this app — we never load or
// export KML/KMZ) pull in @zip.js/zip.js's worker+WASM machinery just by
// being part of Cesium's barrel export. Turbopack's production build
// mis-bundles that WASM file as raw text, corrupting the chunk with illegal
// octal escapes and breaking Cesium's init entirely (see next.config.ts's
// turbopack.resolveAlias). This stub replaces that import so the broken
// code path is never traced into the bundle at all.
export function configure() {}
export class BlobReader {}
export class BlobWriter {}
export class TextReader {}
export class TextWriter {}
export class ZipReader {}
export class ZipWriter {}
export class Data64URIWriter {}
export function terminateWorkers() {}
