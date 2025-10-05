"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

export function LoadingOverlay() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState("Loading...")
  const pathname = usePathname()

  useEffect(() => {
    setIsLoading(false)
  }, [pathname])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest("a")

      if (link && link.href && !link.href.startsWith("mailto:") && !link.href.startsWith("tel:")) {
        const url = new URL(link.href)
        if (url.origin === window.location.origin && url.pathname !== pathname) {
          if (url.pathname.startsWith("/movie/")) {
            setLoadingText("Opening...")
          } else {
            setLoadingText("Loading...")
          }
          setIsLoading(true)
        }
      }
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [pathname])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card border rounded-lg p-6 shadow-lg flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm font-medium">{loadingText}</span>
      </div>
    </div>
  )
}
