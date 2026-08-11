import { searchCatalog } from "@/lib/api"
import { apiFailure, apiSuccess } from "@/lib/server/api-response"
import { serializeTitle } from "@/lib/server/public-catalog"

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams
    const query = params.get("q") || ""
    const page = positiveNumber(params.get("page"), 1)
    const pageSize = Math.min(48, positiveNumber(params.get("pageSize"), 24))
    const result = await searchCatalog(query, page, pageSize)
    return apiSuccess(result.items.map(serializeTitle), {
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      hasNext: result.hasNext,
    })
  } catch (error) {
    return apiFailure(error)
  }
}

function positiveNumber(value: string | null, fallback: number): number {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}
