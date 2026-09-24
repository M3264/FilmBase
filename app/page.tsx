import Link from "next/link"
import { Suspense } from "react"
import { getAiringAnime, getNavLinks, getUnifiedHomeData, catalogToMovieItem } from "@/lib/api"
import { Header } from "@/components/header"
import { FeatureHero } from "@/components/feature-hero"
import { ClubFloor } from "@/components/club-floor"
import { ClubSection } from "@/components/club-section"
import { MixedPosterWall } from "@/components/mixed-poster-wall"
import { TransmissionStrip } from "@/components/transmission-strip"
import { Footer } from "@/components/footer"
import { publicAnimeImageUrl } from "@/lib/presentation-images"
import { JsonLd } from "@/components/json-ld"
import { SITE_URL } from "@/lib/site-url"

export default async function HomePage() {
  const navLinks = await getNavLinks().catch(() => ({ genres: [], categories: [], menuPages: [] }))
  const transmissionLinks = navLinks.genres.length > 0 ? navLinks.genres : navLinks.categories.map(({ name, path }) => ({ name, path }))
  return <div className="min-h-screen"><Header navLinks={navLinks} /><main><JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: "FilmBase", url: SITE_URL, potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/search?q={search_term_string}`, "query-input": "required name=search_term_string" } }} /><Suspense fallback={<HomeFeatureLoading />}><HomeCatalogue /></Suspense><TransmissionStrip genres={transmissionLinks} /><Suspense fallback={<HomeShelfLoading />}><HomeAnime /></Suspense><HomeDirectory /></main><Footer /></div>
}

async function HomeCatalogue() {
  const homeData = await getUnifiedHomeData().catch(() => null)
  const sections = (homeData?.sections ?? []).filter((section) => section.items.length).map((section) => ({ title: section.title, items: section.items.map(catalogToMovieItem) }))
  const heroItems = (homeData?.featured ?? []).map(catalogToMovieItem)
  const counterSections = sections.slice(0, 4)
  return <><FeatureHero items={heroItems} /><div className="club-home site-shell"><MixedPosterWall groups={sections.slice(0, 6)} />{counterSections.length > 0 && <ClubFloor sections={counterSections} />}{sections.slice(4, 8).map((section, index) => <ClubSection key={`${section.title}-${index}`} section={section} mode={( ["strip", "schedule", "wall"] as const)[index % 3]} moreLink={index === 0 ? "/discover/trending" : "/discover/latest"} />)}</div></>
}

async function HomeAnime() {
  const animeData = await getAiringAnime(1, false).catch(() => null)
  const items: any[] = (animeData as any)?.data?.slice(0, 8) ?? []
  if (!items.length) return null
  const section = { title: "Anime after dark", items: items.map((item) => ({ title: item.anime_title, path: `__anime/${encodeURIComponent(item.anime_session ?? item.anime_id)}`, imageUrl: publicAnimeImageUrl(item.snapshot) || "", date: item.episode ? `Episode ${item.episode}` : null })) }
  return <div className="club-home site-shell"><ClubSection mode="schedule" section={section} moreLink="/anime" /></div>
}

function HomeFeatureLoading() { return <section className="club-hero animate-pulse bg-secondary" aria-label="Loading featured titles" /> }
function HomeShelfLoading() { return <div className="club-home site-shell"><div className="h-56 animate-pulse border-y border-border bg-secondary" aria-label="Loading anime shelf" /></div> }
function HomeDirectory() { return <div className="club-home site-shell"><section className="club-directory"><div><p className="eyebrow">Every shelf, one doorway</p><h2>Browse without guessing.</h2></div><div className="club-directory-links"><Link href="/discover">Lucky dip <span>↗</span></Link><Link href="/discover/a-z">A–Z archive <span>↗</span></Link><Link href="/search">Request desk <span>↗</span></Link><Link href="/anime">Anime after dark <span>↗</span></Link></div></section><section className="club-exit"><div><span>Still undecided?</span><h2>Spin the whole archive.</h2></div><Link href="/search">Find something weird <b>↗</b></Link></section></div> }
