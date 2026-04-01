import { notFound } from "next/navigation"
import { getNavLinks, getGenreMovies } from "@/lib/api"
import { Header } from "@/components/header"
import { MovieCard } from "@/components/movie-card"
import { Footer } from "@/components/footer"

function cleanTitle(title: string): string {
  return title
    .replace(/\s*-\s*nkiri\s*/gi, "")
    .replace(/\s*nkiri\s*/gi, "")
    .replace(/\s+archives\s*/gi, "")
    .trim()
}

export default async function SlugPage({
  params,
  searchParams,
}: {
  params: { path: string[] }
  searchParams: { page?: string }
}) {
  const navLinks = await getNavLinks()

  if (!params || !params.path || params.path.length === 0) {
    notFound()
  }

  const fullPath = params.path.join("/")
  const currentPage = Number(searchParams?.page) || 1

  try {
    const genreData = await getGenreMovies(`category/${fullPath}`, currentPage)

    if (!genreData || !genreData.items) {
      notFound()
    }

    const cleanedTitle = cleanTitle(genreData.listTitle)

    return (
      <div className="min-h-screen">
        <Header navLinks={navLinks} />

        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              {cleanedTitle}
            </h1>
            <p className="text-lg text-muted-foreground">
              Page {genreData.currentPage} of {genreData.totalPages}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {genreData.items.map((movie, index) => (
              <MovieCard key={`${movie.path}-${index}`} movie={movie} />
            ))}
          </div>

          {genreData.totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-12">
              {currentPage > 1 && (
                <a
                  href={`/category/${fullPath}?page=${currentPage - 1}`}
                  className="px-6 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                >
                  Previous
                </a>
              )}
              {currentPage < genreData.totalPages && (
                <a
                  href={`/category/${fullPath}?page=${currentPage + 1}`}
                  className="px-6 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                >
                  Next
                </a>
              )}
            </div>
          )}
        </main>

        <Footer />
      </div>
    )
  } catch (error) {
    console.error("[SlugPage] Error loading page:", fullPath, error)
    notFound()
  }
}
