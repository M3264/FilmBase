"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function SearchForm() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="search"
        placeholder="Search movies, series, anime..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1"
        autoFocus
      />
      <Button type="submit" disabled={!query.trim()}>
        <Search className="h-4 w-4 mr-1.5" />
        Search
      </Button>
    </form>
  )
}
