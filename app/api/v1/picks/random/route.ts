import { randomPick, readAlerts } from "@/lib/server/alerts"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export async function GET() {
  const pick = randomPick(await readAlerts())
  return Response.json(pick || { error: "No FilmBase movies available yet" }, { status: pick ? 200 : 503, headers: { "Cache-Control": "no-store" } })
}
