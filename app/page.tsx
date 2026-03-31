import { getNavLinks, getGenreMovies, getAiringAnime } from "@/lib/api"
import { Header } from "@/components/header"
import { MovieSection } from "@/components/movie-section"
import { Footer } from "@/components/footer"
import Script from "next/script"
import Link from "next/link"
import Image from "next/image"

export default async function HomePage() {
  const navLinks = await getNavLinks()

  const categoryResults = await Promise.all(
    navLinks.categories.map((cat) =>
      getGenreMovies(cat.path, 1).catch(() => null)
    )
  )

  const animeData = await getAiringAnime(1, true).catch(() => null)
  const animeItems = animeData?.data?.slice(0, 12) ?? []

  const sections = navLinks.categories
    .map((cat, i) => {
      const data = categoryResults[i]
      if (!data || !data.items?.length) return null
      return {
        category: cat,
        section: {
          title: cat.name,
          items: data.items.slice(0, 6),
        },
      }
    })
    .filter(Boolean) as Array<{
    category: { name: string; path: string }
    section: { title: string; items: any[] }
  }>

  return (
    <div className="min-h-screen">
      {/* Social Bar */}
      <Script
        src="https://pl28996782.profitablecpmratenetwork.com/8b/15/bd/8b15bd93ad7b847fc91e7aeb8cf99c94.js"
        strategy="afterInteractive"
      />

      {/* Native banner script */}
      <Script
        async
        data-cfasync="false"
        src="https://pl28996783.profitablecpmratenetwork.com/aadc53e5aa579316a6819840d149ca4b/invoke.js"
        strategy="afterInteractive"
      />

      <Header navLinks={navLinks} />

      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Hero */}
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

        {/* Native banner — below hero */}
        <div className="w-full mb-12">
          <div id="container-aadc53e5aa579316a6819840d149ca4b" />
        </div>

        {/* Category sections */}
        <div className="space-y-12">
          {sections.map(({ category, section }) => (
            <MovieSection
              key={category.path}
              section={section}
              moreLink={`/${category.path}`}
            />
          ))}
        </div>

        {/* Native banner — between sections and category grid */}
        <div className="w-full my-12">
          <div id="container-aadc53e5aa579316a6819840d149ca4b-2" />
        </div>

        {/* Browse by Category grid */}
        {navLinks.categories.length > 0 && (
          <div className="mt-4 pt-12 border-t border-border">
            <h2 className="text-2xl font-bold tracking-tight mb-6 text-center">
              Browse by Category
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {navLinks.categories.map((cat) => (
                <Link
                  key={cat.path}
                  href={`/${cat.path}`}
                  className="px-6 py-4 bg-secondary hover:bg-secondary/80 rounded-lg text-center transition-colors font-medium"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Menu pages grid */}
        {navLinks.menuPages.filter((p) => p.path).length > 0 && (
          <div className="mt-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {navLinks.menuPages
                .filter((page) => page.path)
                .map((page) => (
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
        )}

        {/* Anime section */}
        {animeItems.length > 0 && (
          <div className="mt-16 pt-12 border-t border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight">🎌 Airing Anime</h2>
              <Link
                href="/anime"
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {animeItems.map((anime: any, index: number) => (
                <Link
                  key={`${anime.anime_id ?? anime.session}-${index}`}
                  href={`/anime/${encodeURIComponent(anime_session ?? anime.anime_id)}`}
                  className="group block"
                >
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary mb-2">
                    {anime.snapshot ? (
                      <Image
                        src={anime.snapshot}
                        alt={anime.anime_title ?? "Anime"}
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
                    {anime.anime_title}
                  </p>
                  {anime.episode && (
                    <p className="text-xs text-muted-foreground mt-0.5">Ep. {anime.episode}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
