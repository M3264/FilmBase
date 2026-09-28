import { eventsAfter, readAlerts } from "@/lib/server/alerts"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const rawLimit = url.searchParams.get("limit") || "50"
  const limit = Number(rawLimit)
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) return Response.json({ error: "limit must be between 1 and 100" }, { status: 400 })
  try {
    const state = await readAlerts()
    const after = url.searchParams.get("after")
    const data = eventsAfter(state, after, limit)
    if (after !== null && state.events.length && Number(after) < Number(state.events[0].id) - 1) return Response.json({ error: "cursor has expired", retainedSince: data.retainedSince }, { status: 410 })
    return Response.json(data, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: (error as Error).message === "Invalid cursor" ? 400 : 500 })
  }
}
