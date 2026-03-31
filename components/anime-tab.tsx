"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface AnimeTabProps {
  query: string
  isActive: boolean
  count: number
}


export function AnimeTab({ query, isActive, count }: AnimeTabProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isActive) setIsLoading(false)
  }, [isActive])

  const handleClick = () => {
    if (isActive) return
    setIsLoading(true)
    router.push(`/search?q=${encodeURIComponent(query)}&tab=anime`)
    // Loading state will clear naturally when the new page renders
    // but we keep it spinning during navigation for feedback
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
        isActive
          ? "bg-primary text-primary-foreground"
          : "bg-secondary hover:bg-secondary/80"
      } disabled:opacity-70 disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading Anime…
        </>
      ) : (
        <>Anime {count > 0 ? `(${count})` : ""}</>
      )}
    </button>
  )
}
