import Link from "next/link"
import Image from "next/image"
import type { MovieItem } from "@/lib/api"

const BASE_URL = "https://api.filmbase.fun"

export function MovieCard({ movie }: { movie: MovieItem }) {
  let imageUrl = null

  if (movie.imageUrl) {
    if (movie.imageUrl.startsWith('http')) {
      try {
        const u = new URL(movie.imageUrl)

        if (
          u.hostname === 'thenkiri.ng' &&
          u.pathname.startsWith('/wp-content/')
        ) {
          imageUrl = `${BASE_URL}/api/image${u.pathname}`
        } else {
          imageUrl = movie.imageUrl
        }
      } catch {
        imageUrl = movie.imageUrl
      }
    } else if (movie.imageUrl.startsWith('/wp-content/')) {
      imageUrl = `${BASE_URL}/api/image${movie.imageUrl}`
    } else {
      imageUrl = movie.imageUrl
    }
  }

  return (
    <Link href={`/movie/${movie.path}`} className="group">
      <div className="space-y-2">
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-secondary">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={movie.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-sm text-center px-4">No Image</span>
            </div>
          )}
        </div>
        <div>
          <h3 className="font-medium line-clamp-2 text-sm group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          {movie.date && (
            <p className="text-xs text-muted-foreground mt-1">{movie.date}</p>
          )}
        </div>
      </div>
    </Link>
  )
}