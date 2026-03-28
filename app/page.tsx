import { getNavLinks, getGenreMovies } from "@/lib/api"
import { Header } from "@/components/header"
import { MovieSection } from "@/components/movie-section"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default async function HomePage() {
  const navLinks = await getNavLinks()

  // Fetch movies for each category in parallel
  const categoryResults = await Promise.all(
    navLinks.categories.map((cat) =>
      getGenreMovies(cat.path, 1).catch(() => null)
    )
  )

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
        
        <!-- Add after the hero heading, around line 48 -->
        <div className="mt-6 flex justify-center">
          <a 
            href="https://www.profitablecpmratenetwork.com/pezbathst?key=e535449979fdb755d369844fe1353106"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors font-medium"
          >
          Explore Offers
          </a>
      </div>
        
        <!-- Around line 49, after the description -->
        <div className="my-8">
          <div id="ad-banner-1"></div>
          <Script strategy="afterInteractive">{`
          atOptions = {
          'key': '5cb8349e16542b4afa6dcd9e470b5d9a',
          'format': 'iframe',
          'height': 60,
          'width': 468,
          'params': {}
          };
         `}</Script>
          <Script src="https://www.highperformanceformat.com/5cb8349e16542b4afa6dcd9e470b5d9a/invoke.js" strategy="afterInteractive" />
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
        
        <!-- Around line 59, after the first category section loop -->
        <div className="my-12">
          <div id="ad-banner-2"></div>
          <Script strategy="afterInteractive">{`
          atOptions = {
          'key': '87ab4027f73db069de8b89cf3e5b854a',
          'format': 'iframe',
          'height': 90,
          'width': 728,
          'params': {}
          };
          `}</Script>
          <Script src="https://www.highperformanceformat.com/87ab4027f73db069de8b89cf3e5b854a/invoke.js" strategy="afterInteractive" />
          </div>
          
        {/* Browse by Category grid */}
        {navLinks.categories.length > 0 && (
          <div className="mt-16 pt-12 border-t border-border">
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

        {/* Menu pages grid — only rendered if menuPages exist */}
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
      </main>

      <Footer />
    </div>
  )
}
