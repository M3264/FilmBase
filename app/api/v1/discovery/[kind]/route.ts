import { discoveryCollectionIds, type DiscoveryCollectionId } from "@/lib/domain/catalog"
import { getAlphabeticalTitles, getDiscoveryCategory, getDiscoveryCollection } from "@/lib/api"
import { apiFailure, apiSuccess } from "@/lib/server/api-response"
import { serializeCatalogPage } from "@/lib/server/public-catalog"

export async function GET(request: Request, { params }: { params: Promise<{ kind: string }> }) {
  try {
    const { kind } = await params
    const query = new URL(request.url).searchParams
    if (discoveryCollectionIds.includes(kind as DiscoveryCollectionId)) return apiSuccess(serializeCatalogPage(await getDiscoveryCollection(kind as DiscoveryCollectionId)))
    if (kind === "category") return apiSuccess(serializeCatalogPage(await getDiscoveryCategory(query.get("slug") || "", positive(query.get("page")))))
    if (kind === "a-z") return apiSuccess(serializeCatalogPage(await getAlphabeticalTitles(query.get("letter") || "")))
    return Response.json({ error: { code: "NOT_FOUND", message: "Discovery feed was not found" } }, { status: 404 })
  } catch (error) { return apiFailure(error) }
}

function positive(value: string | null) { const number = Number(value); return Number.isInteger(number) && number > 0 ? number : 1 }
