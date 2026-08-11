"use client"

import { useEffect } from "react"

const STORAGE_KEY = "filmbase-recently-viewed"
const MAX_ITEMS = 12

interface RecentTitle {
  title: string
  path: string
  imageUrl?: string
  viewedAt: number
}

function isRecentTitle(value: unknown): value is RecentTitle {
  if (!value || typeof value !== "object") return false
  const item = value as Partial<RecentTitle>
  return typeof item.title === "string" && typeof item.path === "string" && typeof item.viewedAt === "number"
}

export function RecentlyViewed({ title, path, imageUrl }: { title: string; path: string; imageUrl?: string }) {
  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
      const existing = Array.isArray(stored) ? stored.filter(isRecentTitle) : []
      const next = [
        { title, path, ...(imageUrl ? { imageUrl } : {}), viewedAt: Date.now() },
        ...existing.filter((item) => item.path !== path),
      ].slice(0, MAX_ITEMS)

      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      window.dispatchEvent(new CustomEvent("filmbase:recently-viewed", { detail: next }))
    } catch {
      // Browsing history is an enhancement; blocked storage must not affect the page.
    }
  }, [title, path, imageUrl])

  return null
}
