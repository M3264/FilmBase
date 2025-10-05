import { MovieCard } from "./movie-card"
import { Button } from "./ui/button"
import Link from "next/link"
import type { HomeSection } from "@/lib/api"

export function MovieSection({
  section,
  moreLink,
}: {
  section: HomeSection
  moreLink?: string
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{section.title}</h2>
        {moreLink && (
          <Link href={moreLink}>
            <Button variant="ghost" size="sm">
              More →
            </Button>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {section.items.map((movie, index) => (
          <MovieCard key={`${movie.path}-${index}`} movie={movie} />
        ))}
      </div>
    </section>
  )
}
