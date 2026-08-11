"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function SearchForm({ initialQuery = "", compact = false }: { initialQuery?: string; compact?: boolean }) {
  const [query, setQuery] = useState(initialQuery)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="grid border-2 border-foreground bg-background sm:grid-cols-[minmax(0,1fr)_auto]">
      <label className="sr-only" htmlFor="catalogue-search">Search the FilmBase catalogue</label>
      <div className="flex min-w-0 items-center">
        <span className="hidden h-full items-center border-r border-border px-4 data-type text-[10px] font-bold text-primary sm:flex">FIND</span>
        <Input
          id="catalogue-search"
          type="search"
          placeholder="Title, genre, actor…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${compact ? "h-12" : "h-14 sm:h-16"} flex-1 rounded-none border-0 bg-transparent px-4 text-base shadow-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:text-lg`}
          autoFocus={!initialQuery}
        />
      </div>
      <Button type="submit" disabled={!query.trim()} className={`${compact ? "h-12" : "h-14 sm:h-16"} rounded-none border-t-2 border-foreground px-5 text-xs uppercase tracking-[.12em] sm:border-l-2 sm:border-t-0 sm:px-7`}>
        <Search className="mr-1 h-4 w-4" />
        Search archive
      </Button>
    </form>
  )
}
