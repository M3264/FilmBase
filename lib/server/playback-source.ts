import { FILMBASE_API_URL } from "@/lib/api-config"
import { directPlaybackSource } from "@/lib/providers/direct-playback"

type PlaybackSource = NonNullable<ReturnType<typeof directPlaybackSource>>
const resolved = new Map<string, { source: PlaybackSource; expires: number }>()

export async function resolvePlaybackSource(value: string, signal: AbortSignal): Promise<PlaybackSource> {
  const source = directPlaybackSource(value)
  if (!source) throw new Error("Unsupported media source")
  if (!source.requiresResolution) return source
  const key = source.url.href
  const cached = resolved.get(key)
  if (cached && cached.expires > Date.now()) return cached.source
  resolved.delete(key)

  // Reuse the existing provider resolver; never fetch a landing-page URL in the browser.
  const response = await fetch(`${FILMBASE_API_URL}/api/resolve-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intermediateUrl: key }),
    cache: "no-store",
    signal: AbortSignal.any([signal, AbortSignal.timeout(60_000)]),
    redirect: "error",
  })
  if (!response.ok) { await response.body?.cancel(); throw new Error("Media resolution failed") }
  const result = await response.json() as { success?: boolean; directLink?: string }
  const target = result.success === true && typeof result.directLink === "string" ? directPlaybackSource(result.directLink) : null
  if (!target || target.requiresResolution) throw new Error("Resolver did not return an eligible media destination")
  // File-host tokens are short-lived. Bound both age and count, without storing media.
  if (resolved.size >= 128) {
    const oldest = resolved.keys().next().value
    if (oldest) resolved.delete(oldest)
  }
  resolved.set(key, { source: target, expires: Date.now() + 45_000 })
  return target
}
