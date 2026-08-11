import { getAlphabeticalTitles } from "@/lib/api"
import { apiFailure, apiSuccess } from "@/lib/server/api-response"
import { serializeCatalogPage } from "@/lib/server/public-catalog"

export async function GET(_request: Request, { params }: { params: Promise<{ letter: string }> }) {
  try {
    const { letter } = await params
    const page = serializeCatalogPage(await getAlphabeticalTitles(letter))
    return apiSuccess(page.items, { page: page.page, pageSize: page.pageSize, total: page.total, hasNext: page.hasNext })
  } catch (error) {
    return apiFailure(error)
  }
}
