/** Icons live in public/assets/tech — served at /assets/tech/. Never commit icons only under dist/. */
const BASE = "/assets/tech";
const VERSION = "5";

export function techAssetUrl(fileName: string): string {
  return `${BASE}/${encodeURIComponent(fileName)}?v=${VERSION}`;
}
