import { getDiscoveryCategory } from "@/lib/api"
import { apiFailure, apiSuccess } from "@/lib/server/api-response"
import { serializeCatalogPage } from "@/lib/server/public-catalog"

export async function GET(request: Request, { params }: { params: Promise<{ category: string }> }) {
  try {
    const { category } = await params
    const pageNumber = positiveNumber(new URL(request.url).searchParams.get("page"), 1)
    const page = serializeCatalogPage(await getDiscoveryCategory(category, pageNumber))
    return apiSuccess(page.items, { page: page.page, pageSize: page.pageSize, total: page.total, hasNext: page.hasNext })
  } catch (error) {
    return apiFailure(error)
  }
}

function positiveNumber(value: string | null, fallback: number): number {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}
