import type { Metadata } from "next"
import { getMovieDetails, getNavLinks, searchMovies } from "@/lib/api"
import { Header } from "@/components/header"
import { MovieCard } from "@/components/movie-card"
import { Footer } from "@/components/footer"
import { DownloadButton } from "@/components/download-button"
import Image from "next/image"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import Script from "next/script"

const BASE_URL = "https://api.filmbase.fun"

export async function generateMetadata({
  params,
}: {
  params: { path: string[] }
}): Promise<Metadata> {
  const moviePath = params.path.join("/")
  const movie = await getMovieDetails(moviePath)

  let imageUrl = ""
  try {
    const searchResult = await searchMovies(movie.title, 1)
    const match =
      searchResult.items.find(
        (item) =>
          item.title.toLowerCase() === movie.title.toLowerCase() ||
          item.path === movie.path
      ) || searchResult.items[0]

    if (match?.imageUrl) {
      imageUrl = match.imageUrl.startsWith("http")
        ? match.imageUrl
        : `${BASE_URL}/api/image${match.imageUrl}`
    }
  } catch {}

  return {
    title: `${movie.title} - FilmBase`,
    description: movie.synopsis?.slice(0, 160) || `Download ${movie.title} on FilmBase`,
    openGraph: {
      title: movie.title,
      description: movie.synopsis?.slice(0, 160) || "",
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: "video.movie",
    },
    twitter: {
      card: "summary_large_image",
      title: movie.title,
      description: movie.synopsis?.slice(0, 160) || "",
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

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
      {/* Social Bar */}
      <Script
        src="https://pl28996782.profitablecpmratenetwork.com/8b/15/bd/8b15bd93ad7b847fc91e7aeb8cf99c94.js"
        strategy="afterInteractive"
      />

      {/* Native banner script — loaded once, powers all container divs */}
      <Script
        async
        data-cfasync="false"
        src="https://pl28996783.profitablecpmratenetwork.com/aadc53e5aa579316a6819840d149ca4b/invoke.js"
        strategy="afterInteractive"
      />

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

            {/* Native 4:1 banner — between trailer and download */}
            <div className="w-full">
              <div id="container-aadc53e5aa579316a6819840d149ca4b" />
            </div>

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

        {/* Native 4:1 banner — above related movies */}
        {relatedMoviesWithImages.length > 0 && (
          <div className="w-full mb-8">
            <div id="container-aadc53e5aa579316a6819840d149ca4b-2" />
          </div>
        )}

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