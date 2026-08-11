import { NextResponse } from "next/server"
import { CatalogApiError } from "@/lib/domain/catalog"

export function apiSuccess<T>(data: T, meta: Record<string, unknown> = {}) {
  return NextResponse.json({ data, meta })
}

export function apiFailure(error: unknown) {
  const requestId = crypto.randomUUID()
  if (error instanceof CatalogApiError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message, requestId } },
      { status: error.status && error.status >= 400 && error.status < 600 ? error.status : 502 },
    )
  }
  console.error(`[api:${requestId}]`, error)
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "The catalogue could not be loaded", requestId } },
    { status: 500 },
  )
}
