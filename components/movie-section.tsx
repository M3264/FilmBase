import Link from "next/link"
import type { HomeSection } from "@/lib/api"
import { MovieCard } from "./movie-card"

export function MovieSection({ section, moreLink, compact = false }: { section: HomeSection; moreLink?: string; compact?: boolean }) {
  return (
    <section className="editorial-rule pt-4">
      <div className="mb-6 grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-end">
        <span className="data-type text-[10px] font-bold text-primary">FB / SHELF</span>
        <div><p className="eyebrow mb-2 text-muted-foreground">Now in circulation</p><h2 className="fluid-section-title font-semibold">{section.title}</h2></div>
        {moreLink && <Link href={moreLink} className="eyebrow w-fit border-b border-foreground pb-1 outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background">Open full shelf →</Link>}
      </div>
      <div className={compact ? "border-t border-border" : "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:gap-x-7"}>
        {section.items.map((movie, index) => <MovieCard key={`${movie.path}-${index}`} movie={movie} compact={compact} index={index} />)}
      </div>
    </section>
  )
}
