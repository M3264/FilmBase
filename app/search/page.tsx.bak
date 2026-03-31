import { searchMovies, getNavLinks } from "@/lib/api"
import { Header } from "@/components/header"
import { MovieCard } from "@/components/movie-card"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string }
}) {
  const query = searchParams.q || ""
  const page = Number.parseInt(searchParams.page || "1")

  const navLinks = await getNavLinks()

  if (!query || query.trim() === "") {
    return (
      <div className="min-h-screen">
        <Header navLinks={navLinks} />

        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold tracking-tight mb-4">Search</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Enter a search term to find movies and TV series
            </p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

  try {
    const results = await searchMovies(query, page)
    
    const cleanTitle = (title: string) => {
      return title
        .replace(/\s*-\s*nkiri\s*/gi, "")
        .replace(/\s*nkiri\s*/gi, "")
        .replace(/\s+archives\s*/gi, "")
        .trim()
    }

    return (
      <div className="min-h-screen">
        <Header navLinks={navLinks} />

        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Search Results for "{query}"</h1>
            <p className="text-muted-foreground">
              Found {results.items.length} results (Page {results.currentPage} of {results.totalPages})
            </p>
          </div>

          {results.items.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {results.items.map((movie, index) => (
                  <MovieCard key={`${movie.path}-${index}`} movie={movie} />
                ))}
              </div>

              {results.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  {page > 1 && (
                    <Link href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}>
                      <Button variant="outline">Previous</Button>
                    </Link>
                  )}
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {results.totalPages}
                  </span>
                  {page < results.totalPages && (
                    <Link href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}>
                      <Button variant="outline">Next</Button>
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground mb-8">No results found for your search.</p>
              <Link href="/">
                <Button>Go Home</Button>
              </Link>
            </div>
          )}
        </main>

        <Footer />
      </div>
    )
  } catch (error) {
    console.error("Search error:", error)
    
    return (
      <div className="min-h-screen">
        <Header navLinks={navLinks} />

        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold tracking-tight mb-4">Search Error</h1>
            <p className="text-lg text-muted-foreground mb-8">
              There was an error processing your search. Please try again.
            </p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    )
  }
}