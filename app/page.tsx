import { getHomeData, getNavLinks, getGenreMovies, getMenuContent } from "@/lib/api"
import { Header } from "@/components/header"
import { MovieSection } from "@/components/movie-section"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default async function HomePage() {
  const navLinks = await getNavLinks()

  const [actionData, animationData, kdramaData, seriesData] = await Promise.all([
    getGenreMovies("tag/action", 1).catch(() => null),
    getGenreMovies("tag/animation", 1).catch(() => null),
    getMenuContent("korean-drama-menu").catch(() => null),
    getMenuContent("tv-series-menu").catch(() => null),
  ])

  const actionSection = actionData ? {
    title: "Action Movies",
    items: actionData.items.slice(0, 6)
  } : null

  const animationSection = animationData ? {
    title: "Animation",
    items: animationData.items.slice(0, 6)
  } : null

  const kdramaSection = kdramaData?.sections?.[0] ? {
    title: "K-Drama",
    items: kdramaData.sections[0].items.slice(0, 6)
  } : null

  const seriesSection = seriesData?.sections?.[0] ? {
    title: "TV Series",
    items: seriesData.sections[0].items.slice(0, 6)
  } : null

  return (
    <div className="min-h-screen">
      <Header navLinks={navLinks} />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Discover Your Next
            <br />
            <span className="text-primary">Favorite Film</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore thousands of movies, TV series, and K-dramas. Download and enjoy premium content.
          </p>
        </div>

        <div className="space-y-12">
          {actionSection && (
            <MovieSection 
              section={actionSection} 
              moreLink="/tag/action" 
            />
          )}

          {animationSection && (
            <MovieSection 
              section={animationSection} 
              moreLink="/tag/animation" 
            />
          )}

          {kdramaSection && (
            <MovieSection 
              section={kdramaSection} 
              moreLink="/korean-drama-menu" 
            />
          )}

          {seriesSection && (
            <MovieSection 
              section={seriesSection} 
              moreLink="/tv-series-menu" 
            />
          )}
        </div>

        <div className="mt-16 pt-12 border-t border-border">
          <h2 className="text-2xl font-bold tracking-tight mb-6 text-center">Browse by Genre</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {navLinks.genres.map((genre) => (
              <Link
                key={genre.path}
                href={`/${genre.path}`}
                className="px-6 py-4 bg-secondary hover:bg-secondary/80 rounded-lg text-center transition-colors font-medium"
              >
                {genre.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {navLinks.menuPages.filter(page => page.path).map((page) => (
              <Link
                key={page.path}
                href={`/${page.path}`}
                className="px-6 py-4 bg-primary/10 hover:bg-primary/20 rounded-lg text-center transition-colors font-medium"
              >
                {page.name}
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}