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
      aria-pressed={isActive}
      className={`flex items-center gap-2 border px-4 py-2.5 data-type text-[10px] font-bold uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        isActive
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card hover:border-primary hover:text-primary"
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
