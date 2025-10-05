import Link from "next/link"
import Image from "next/image"
import type { MovieItem } from "@/lib/api"

const BASE_URL = "https://silver-fishstick-chi.vercel.app"

export function MovieCard({ movie }: { movie: MovieItem }) {
  const imageUrl = movie.imageUrl.startsWith("http") ? movie.imageUrl : `${BASE_URL}/api/image${movie.imageUrl}`

  return (
    <Link href={`/movie/${movie.path}`} className="group">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-secondary border border-border/50 shadow-lg hover:shadow-primary/20 transition-all duration-300">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 ring-1 ring-inset ring-primary/0 group-hover:ring-primary/50 rounded-lg transition-all duration-300" />
      </div>
      <h3 className="mt-3 text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
        {movie.title}
      </h3>
      {movie.date && <p className="text-xs text-muted-foreground mt-1">{movie.date}</p>}
    </Link>
  )
}
