import Link from "next/link"
import { getNavLinks, getUnifiedHomeData, getAiringAnime, catalogToMovieItem } from "@/lib/api"
import { Header } from "@/components/header"
import { FeatureHero } from "@/components/feature-hero"
import { ClubFloor } from "@/components/club-floor"
import { ClubSection } from "@/components/club-section"
import { MixedPosterWall } from "@/components/mixed-poster-wall"
import { TransmissionStrip } from "@/components/transmission-strip"
import { Footer } from "@/components/footer"
import { publicAnimeImageUrl } from "@/lib/presentation-images"
import { JsonLd } from "@/components/json-ld"

export default async function HomePage() {
  const [navLinks, homeData, animeData] = await Promise.all([
    getNavLinks().catch(() => ({ genres: [], categories: [], menuPages: [] })),
    getUnifiedHomeData().catch(() => null),
    getAiringAnime(1, false).catch(() => null),
  ])
  const animeItems: any[] = (animeData as any)?.data?.slice(0, 8) ?? []
  const sections = (homeData?.sections ?? []).filter((section) => section.items.length).map((section) => ({
    title: section.title,
    items: section.items.map(catalogToMovieItem),
  }))
  const heroItems = (homeData?.featured ?? []).map(catalogToMovieItem)
  const animeSection = animeItems.length > 0 ? {
    title: "Anime after dark",
    items: animeItems.map((item) => ({ title: item.anime_title, path: `__anime/${encodeURIComponent(item.anime_session ?? item.anime_id)}`, imageUrl: publicAnimeImageUrl(item.snapshot) || "", date: item.episode ? `Episode ${item.episode}` : null })),
  } : null
  const wallSections = animeSection ? [...sections.slice(0, 5), animeSection] : sections.slice(0, 6)
  const counterSections = sections.slice(0, 4)
  const transmissionLinks = navLinks.genres.length > 0 ? navLinks.genres : navLinks.categories.map(({ name, path }) => ({ name, path }))

  return (
    <div className="min-h-screen">
      <Header navLinks={navLinks} />
      <main>
        <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: "FilmBase", url: "https://filmbase.fun", potentialAction: { "@type": "SearchAction", target: "https://filmbase.fun/search?q={search_term_string}", "query-input": "required name=search_term_string" } }} />
        <FeatureHero items={heroItems} />
        <TransmissionStrip genres={transmissionLinks} />
        <div className="club-home site-shell">
          <MixedPosterWall groups={wallSections} />
          {counterSections.length > 0 && <ClubFloor sections={counterSections} />}
          {sections.slice(4, 8).map((section, index) => <ClubSection key={`${section.title}-${index}`} section={section} mode={(["strip", "schedule", "wall"] as const)[index % 3]} moreLink={index === 0 ? "/discover/trending" : "/discover/latest"} />)}
          {animeSection && <ClubSection mode="schedule" section={animeSection} moreLink="/anime" />}
          <section className="club-directory">
            <div><p className="eyebrow">Every shelf, one doorway</p><h2>Browse without guessing.</h2></div>
            <div className="club-directory-links">
              <Link href="/discover">Lucky dip <span>↗</span></Link>
              <Link href="/discover/a-z">A–Z archive <span>↗</span></Link>
              <Link href="/search">Request desk <span>↗</span></Link>
              <Link href="/anime">Anime after dark <span>↗</span></Link>
            </div>
          </section>
          <section className="club-exit">
            <div><span>Still undecided?</span><h2>Spin the whole archive.</h2></div>
            <Link href="/search">Find something weird <b>↗</b></Link>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
