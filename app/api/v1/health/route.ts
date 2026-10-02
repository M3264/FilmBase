import { FILMBASE_API_URL } from "@/lib/api-config"
import { apiSuccess } from "@/lib/server/api-response"

export async function GET() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 3_000)
  const started = Date.now()
  let ok = false
  try {
    const response = await fetch(`${FILMBASE_API_URL}/v1/health`, { cache: "no-store", signal: controller.signal })
    const body = await response.json()
    ok = response.ok && body.data?.status === "ok" && body.data?.database === "ok"
  } catch { /* report the unavailable upstream */ }
  finally { clearTimeout(timer) }
  return apiSuccess({
    status: ok ? "available" : "unavailable",
    apiUrl: FILMBASE_API_URL,
    providers: ["legacy", "ninejarocks"].map((provider) => ({ provider, ok, latencyMs: Date.now() - started })),
  })
}
