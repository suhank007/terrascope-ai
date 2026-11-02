import "server-only";

export const USER_AGENT = "TerraScope-AI/1.0 (https://terrascope-ai.vercel.app)";
const DEFAULT_TIMEOUT_MS = 20_000;
const RETRY_DELAY_MS = 600;

export interface FetchOptions {
  timeoutMs?: number;
}

export interface Fetched<T> {
  /** HTTP status, or 0 when the request never completed (network error or timeout). */
  status: number;
  data: T | null;
}

async function attempt(url: string, revalidate: number, accept: string, timeoutMs: number): Promise<Response | null> {
  try {
    return await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: accept },
      next: { revalidate },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    return null;
  }
}

/** One quick retry on an overloaded upstream (503) or a dropped request, which is
 *  how Open-Meteo and the weather service fail under load; it clears in a moment. */
async function get(url: string, revalidate: number, accept: string, timeoutMs: number): Promise<Response | null> {
  let res = await attempt(url, revalidate, accept, timeoutMs);
  if (!res || res.status === 503) {
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    res = (await attempt(url, revalidate, accept, timeoutMs)) ?? res;
  }
  return res;
}

/** Like getJson, but tells you *why* it came back empty: 204 (nothing to report) is not a failure. */
export async function getJsonDetailed<T>(
  url: string,
  revalidate: number,
  accept = "application/json",
  { timeoutMs = DEFAULT_TIMEOUT_MS }: FetchOptions = {}
): Promise<Fetched<T>> {
  const res = await get(url, revalidate, accept, timeoutMs);
  if (!res) return { status: 0, data: null };
  if (!res.ok || res.status === 204) return { status: res.status, data: null };
  try {
    return { status: res.status, data: (await res.json()) as T };
  } catch {
    return { status: res.status, data: null };
  }
}

/** GET that returns null on any failure (network, timeout, non-2xx, bad body) so
 *  one dead feed degrades its own section instead of the whole page. */
export async function getJson<T>(url: string, revalidate: number, accept = "application/json", options?: FetchOptions): Promise<T | null> {
  return (await getJsonDetailed<T>(url, revalidate, accept, options)).data;
}

export async function getText(url: string, revalidate: number, options: FetchOptions = {}): Promise<string | null> {
  const res = await get(url, revalidate, "application/rss+xml, application/xml, text/xml, */*", options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  if (!res?.ok) return null;
  try {
    return await res.text();
  } catch {
    return null;
  }
}
