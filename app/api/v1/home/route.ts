import { getUnifiedHomeData } from "@/lib/api"
import { apiFailure, apiSuccess } from "@/lib/server/api-response"
import { serializeHome } from "@/lib/server/public-catalog"

export async function GET() {
  try {
    return apiSuccess(serializeHome(await getUnifiedHomeData()))
  } catch (error) {
    return apiFailure(error)
  }
}
