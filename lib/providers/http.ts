import { CatalogApiError, type Provider } from "@/lib/domain/catalog"

export async function fetchJson<T>(
  url: string,
  options: RequestInit & { timeoutMs?: number; provider?: Provider } = {},
): Promise<T> {
  // Catalogue providers are optional inputs to the UI. Fail quickly so a slow
  // provider cannot hold hundreds of server-render requests open at once.
  const { timeoutMs = 6_000, provider = null, ...request } = options
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    assertAllowedUpstream(url, provider)
    const response = await fetch(url, { ...request, signal: controller.signal })
    if (!response.ok) {
      throw new CatalogApiError(
        `FilmBase provider returned ${response.status}`,
        "UPSTREAM_RESPONSE",
        response.status,
        provider,
      )
    }
    return (await response.json()) as T
  } catch (error) {
    if (error instanceof CatalogApiError) throw error
    const timedOut = error instanceof Error && error.name === "AbortError"
    throw new CatalogApiError(
      timedOut ? "FilmBase provider timed out" : "FilmBase provider is unavailable",
      timedOut ? "UPSTREAM_TIMEOUT" : "UPSTREAM_UNAVAILABLE",
      null,
      provider,
    )
  } finally {
    clearTimeout(timeout)
  }
}

function assertAllowedUpstream(value: string, provider: Provider | null): void {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new CatalogApiError("Invalid upstream URL", "INVALID_UPSTREAM", 500, provider)
  }

  const allowed = [
    process.env.FILMBASE_LEGACY_API_URL || "https://api.filmbase.fun",
    process.env.FILMBASE_API2_URL || "https://api2.filmbase.fun",
  ].map((origin) => new URL(origin).origin)

  if (!allowed.includes(url.origin) || !/^https?:$/.test(url.protocol) || url.username || url.password) {
    throw new CatalogApiError("Upstream URL is not allowlisted", "UPSTREAM_NOT_ALLOWED", 500, provider)
  }
}
