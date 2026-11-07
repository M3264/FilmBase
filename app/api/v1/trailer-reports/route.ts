import { appendFile, mkdir, readFile } from "node:fs/promises"
import { apiFailure, apiSuccess } from "@/lib/server/api-response"

const REPORTS_FILE = "/app/data/trailer-reports.jsonl"

async function readReports(): Promise<unknown[]> {
  try {
    const raw = await readFile(REPORTS_FILE, "utf8")
    return raw.split("\n").filter(Boolean).map((line) => JSON.parse(line))
  } catch {
    return []
  }
}

export async function GET() {
  try {
    return apiSuccess({ reports: await readReports() })
  } catch (error) {
    return apiFailure(error)
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { path?: unknown; title?: unknown; videoId?: unknown }
    const path = typeof body.path === "string" ? body.path.slice(0, 300) : ""
    const title = typeof body.title === "string" ? body.title.slice(0, 300) : ""
    const videoId = typeof body.videoId === "string" ? body.videoId.slice(0, 32) : ""
    if (!path || !videoId) throw new Error("path and videoId are required")
    await mkdir("/app/data", { recursive: true })
    await appendFile(REPORTS_FILE, `${JSON.stringify({ at: new Date().toISOString(), path, title, videoId })}\n`)
    return apiSuccess({ stored: true })
  } catch (error) {
    return apiFailure(error)
  }
}
