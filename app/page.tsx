import { getHomeData, getNavLinks } from "@/lib/api"
import { Header } from "@/components/header"
import { MovieSection } from "@/components/movie-section"
import { Footer } from "@/components/footer"

export default async function HomePage() {
  const [sections, navLinks] = await Promise.all([getHomeData(), getNavLinks()])

  const actionSection = sections.find((s) => s.title.toLowerCase().includes("action"))
  const seriesSection = sections.find(
    (s) => s.title.toLowerCase().includes("series") || s.title.toLowerCase().includes("tv"),
  )
  const otherSections = sections.filter((s) => s !== actionSection && s !== seriesSection)

  const orderedSections = [actionSection, seriesSection, ...otherSections].filter(Boolean)

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
          {orderedSections.map((section, index) => {
            let moreLink: string | undefined

            if (section.title.toLowerCase().includes("action")) {
              moreLink = "/tag/action"
            } else if (section.title.toLowerCase().includes("series") || section.title.toLowerCase().includes("tv")) {
              moreLink = "/tv-series-menu"
            }

            return <MovieSection key={`${section.title}-${index}`} section={section} moreLink={moreLink} />
          })}
        </div>
      </main>

      <Footer />
    </div>
  )
}
