"use client"

import { useEffect, useState } from "react"
import { Grid2X2, List } from "lucide-react"
import type { MovieItem } from "@/lib/api"
import { MovieCard } from "./movie-card"

export function CatalogView({ items }: { items: MovieItem[] }) {
  const [view, setView] = useState<"grid" | "compact">("grid")
  useEffect(() => { const stored = localStorage.getItem("filmbase-catalog-view"); if (stored === "compact") setView("compact") }, [])
  const choose = (next: "grid" | "compact") => { setView(next); localStorage.setItem("filmbase-catalog-view", next) }
  return (
    <>
      <div className="mb-6 flex flex-col gap-3 border-y border-border py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="data-type text-[10px] uppercase text-muted-foreground" aria-live="polite">
          {items.length} titles on this shelf / {view === "grid" ? "Poster view" : "Low-data list"}
        </p>
        <div className="flex w-fit border border-border bg-background" role="group" aria-label="Catalogue view">
          <button onClick={() => choose("grid")} aria-pressed={view === "grid"} className={`flex h-10 items-center gap-2 border-r border-border px-3 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${view === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`} aria-label="Poster grid"><Grid2X2 className="h-4 w-4" /><span>Posters</span></button>
          <button onClick={() => choose("compact")} aria-pressed={view === "compact"} className={`flex h-10 items-center gap-2 px-3 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${view === "compact" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`} aria-label="Low-data list"><List className="h-4 w-4" /><span>Low data</span></button>
        </div>
      </div>
      {items.length ? (
        <div className={view === "grid" ? "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:gap-x-7" : "border-t border-border"}>
          {items.map((movie, index) => <MovieCard key={`${movie.path}-${index}`} movie={movie} compact={view === "compact"} index={index} />)}
        </div>
      ) : (
        <div className="border-y border-border py-16 text-center">
          <p className="eyebrow text-primary">Shelf unavailable</p>
          <p className="mt-3 text-sm text-muted-foreground">No catalogue titles were returned for this page.</p>
        </div>
      )}
    </>
  )
}
