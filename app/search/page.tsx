import { searchMovies, getNavLinks, searchAnime } from "@/lib/api"
import { Header } from "@/components/header"
import { MovieCard } from "@/components/movie-card"
import { Footer } from "@/components/footer"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { SearchForm } from "@/components/search-form"
import { AnimeTab } from "@/components/anime-tab"

const PROXY = "https://api.filmbase.fun/api/anime/image-proxy?url="
const proxyImage = (url?: string) => url ? `${PROXY}${encodeURIComponent(url)}` : null

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string; tab?: string }
}) {
  const query = searchParams.q || ""
  const page = Number.parseInt(searchParams.page || "1")
  const tab = searchParams.tab || "movies"

  const navLinks = await getNavLinks()

  if (!query || query.trim() === "") {
    return (
      <div className="min-h-screen">
        <Header navLinks={navLinks} />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold tracking-tight mb-4">Search</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Enter a search term to find movies, TV series, and anime
            </p>
            {/* Search box visible on empty state */}
            <div className="max-w-md mx-auto mb-6">
              <SearchForm />
            </div>
            <Link href="/"><Button variant="ghost">Go Home</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const [movieResults, animeResults] = await Promise.all([
    searchMovies(query, page).catch(() => null),
    searchAnime(query).catch(() => null),
  ])

  const animeItems: any[] = Array.isArray(animeResults)
    ? animeResults
    : (animeResults as any)?.data ?? []

  return (
    <div className="min-h-screen">
      <Header navLinks={navLinks} />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            Search Results for &quot;{query}&quot;
          </h1>

          {/* Tabs — Anime tab is a client component with loading state */}
          <div className="flex gap-2">
            <Link
              href={`/search?q=${encodeURIComponent(query)}&tab=movies`}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                tab === "movies" ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              Movies {movieResults ? `(${movieResults.items.length})` : ""}
            </Link>
            <AnimeTab
              query={query}
              isActive={tab === "anime"}
              count={animeItems.length}
            />
          </div>
        </div>

        {/* Movies tab */}
        {tab === "movies" && (
          <>
            {movieResults && movieResults.items.length > 0 ? (
              <>
                <p className="text-muted-foreground mb-6">
                  Page {movieResults.currentPage} of {movieResults.totalPages}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {movieResults.items.map((movie, index) => (
                    <MovieCard key={`${movie.path}-${index}`} movie={movie} />
                  ))}
                </div>
                {movieResults.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-12">
                    {page > 1 && (
                      <Link href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}&tab=movies`}>
                        <Button variant="outline">Previous</Button>
                      </Link>
                    )}
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {movieResults.totalPages}
                    </span>
                    {page < movieResults.totalPages && (
                      <Link href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}&tab=movies`}>
                        <Button variant="outline">Next</Button>
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground mb-4">No movies found for &quot;{query}&quot;.</p>
                <Link href={`/search?q=${encodeURIComponent(query)}&tab=anime`}>
                  <Button variant="outline">Try Anime results</Button>
                </Link>
              </div>
            )}
          </>
        )}

        {/* Anime tab content */}
        {tab === "anime" && (
          <>
            {animeItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {animeItems.map((anime: any, index: number) => {
                  const img = proxyImage(anime.image)
                  return (
                    <Link
                      key={`${anime.id}-${index}`}
                      href={`/anime/${encodeURIComponent(anime.id)}`}
                      className="group block"
                    >
                      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-secondary mb-2">
                        {img ? (
                          <Image
                            src={img}
                            alt={anime.title ?? "Anime"}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                        {anime.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {anime.type}{anime.release_date ? ` · ${anime.release_date}` : ""}
                      </p>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground mb-4">No anime found for &quot;{query}&quot;.</p>
                <Link href={`/search?q=${encodeURIComponent(query)}&tab=movies`}>
                  <Button variant="outline">Try Movie results</Button>
                </Link>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
