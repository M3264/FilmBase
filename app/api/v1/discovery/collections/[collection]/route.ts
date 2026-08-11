import { getDiscoveryCollection, type DiscoveryCollectionId } from "@/lib/api"
import { discoveryCollectionIds } from "@/lib/domain/catalog"
import { apiFailure, apiSuccess } from "@/lib/server/api-response"
import { serializeCatalogPage } from "@/lib/server/public-catalog"

export async function GET(_request: Request, { params }: { params: Promise<{ collection: string }> }) {
  try {
    const { collection } = await params
    if (!discoveryCollectionIds.includes(collection as DiscoveryCollectionId)) {
      return Response.json({ error: { code: "NOT_FOUND", message: "Discovery collection was not found" } }, { status: 404 })
    }
    const page = serializeCatalogPage(await getDiscoveryCollection(collection as DiscoveryCollectionId))
    return apiSuccess(page.items, catalogMeta(page))
  } catch (error) {
    return apiFailure(error)
  }
}

function catalogMeta(page: { page: number; pageSize: number; total: number | null; hasNext: boolean }) {
  return { page: page.page, pageSize: page.pageSize, total: page.total, hasNext: page.hasNext }
}
