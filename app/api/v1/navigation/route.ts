import { getNavLinks } from "@/lib/api"
import { apiFailure, apiSuccess } from "@/lib/server/api-response"

export async function GET() {
  try {
    return apiSuccess(await getNavLinks())
  } catch (error) {
    return apiFailure(error)
  }
}
