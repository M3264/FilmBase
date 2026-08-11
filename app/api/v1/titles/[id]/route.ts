import { getCatalogTitle } from "@/lib/api"
import { apiFailure, apiSuccess } from "@/lib/server/api-response"
import { serializeTitle } from "@/lib/server/public-catalog"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    return apiSuccess(serializeTitle(await getCatalogTitle(decodeURIComponent(id))))
  } catch (error) {
    return apiFailure(error)
  }
}
