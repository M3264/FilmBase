import { authorized, synchronize } from "@/lib/server/alerts"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 300

export async function POST(request: Request) {
  if (!authorized(request.headers.get("authorization"))) return Response.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const result = await synchronize()
    return Response.json(result, { status: result.errors.length ? 502 : 200, headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 503 })
  }
}
