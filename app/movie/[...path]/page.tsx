import { getMovieDetails, getNavLinks, searchMovies } from "@/lib/api"
import { Header } from "@/components/header"
import { MovieCard } from "@/components/movie-card"
import { Footer } from "@/components/footer"
import { DownloadButton } from "@/components/download-button"
import Image from "next/image"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"

const BASE_URL = "https://silver-fishstick-y2se.onrender.com"

export default async function MoviePage({
  params,
}: {
  params: { path: string[] }
}) {
  const moviePath = params.path.join("/")

  const [movie, navLinks] = await Promise.all([getMovieDetails(moviePath), getNavLinks()])

  let imageUrl = ""

  try {
    const searchResult = await searchMovies(movie.title, 1)

    const exactMatch = searchResult.items.find(
      (item) => item.title.toLowerCase() === movie.title.toLowerCase() || item.path === movie.path,
    )

    if (exactMatch?.imageUrl) {
      imageUrl = exactMatch.imageUrl.startsWith("http")
        ? exactMatch.imageUrl
        : `${BASE_URL}/api/image${exactMatch.imageUrl}`
    } else {
      const partialMatch = searchResult.items.find((item) =>
        item.title.toLowerCase().includes(movie.title.toLowerCase().split(" ")[0]),
      )

      if (partialMatch?.imageUrl) {
        imageUrl = partialMatch.imageUrl.startsWith("http")
          ? partialMatch.imageUrl
          : `${BASE_URL}/api/image${partialMatch.imageUrl}`
      }
    }
  } catch (error) {
    console.error("Error searching for movie thumbnail:", error)
  }

  const relatedMoviesWithImages = movie.relatedMovies.filter(m => m.imageUrl)

  return (
    <div className="min-h-screen">
      <Header navLinks={navLinks} />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="grid md:grid-cols-[300px_1fr] gap-8 mb-12">
          {imageUrl && (
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-secondary">
              <Image src={imageUrl} alt={movie.title} fill className="object-cover" priority />
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">{movie.title}</h1>
              {movie.downloadSize && <p className="text-sm text-muted-foreground">Size: {movie.downloadSize}</p>}
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Synopsis</h2>
              <p className="text-muted-foreground leading-relaxed">{movie.synopsis}</p>
            </div>

            {movie.trailerUrl && (
              <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Play className="h-4 w-4" />
                  Watch Trailer
                </Button>
              </a>
            )}

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Download</h2>
              {movie.downloadItems.map((item, index) => (
                <DownloadButton 
                  key={index} 
                  intermediateUrl={item.intermediateUrl} 
                  text={item.text}
                  season={item.season}
                  episode={item.episode}
                />
              ))}
            </div>
          </div>
        </div>

        {relatedMoviesWithImages.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Related Movies</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {relatedMoviesWithImages.map((relatedMovie, index) => (
                <MovieCard key={`${relatedMovie.path}-${index}`} movie={relatedMovie} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}