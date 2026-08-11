import { apiOrigins } from "@/lib/api"
import { NINEJAROCKS_URL } from "@/lib/providers/ninejarocks"
import { apiSuccess } from "@/lib/server/api-response"

export async function GET() {
  const checks = await Promise.all([
    check("legacy", apiOrigins.legacy),
    check("ninejarocks", NINEJAROCKS_URL),
  ])
  return apiSuccess({ status: checks.some((item) => item.ok) ? "available" : "unavailable", providers: checks })
}

async function check(provider: string, url: string) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 3_000)
  const started = Date.now()
  try {
    // Some upstream FastAPI deployments do not implement HEAD even though GET
    // health endpoints are available. Keep the probe read-only but use GET so
    // the provider status reflects the contract we actually consume.
    const response = await fetch(url, { cache: "no-store", signal: controller.signal })
    return { provider, ok: response.ok, latencyMs: Date.now() - started }
  } catch {
    return { provider, ok: false, latencyMs: Date.now() - started }
  } finally {
    clearTimeout(timer)
  }
}
