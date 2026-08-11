import { getDiscoveryCategory, getNavLinks } from "@/lib/api"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DiscoveryShelf } from "@/components/discovery-shelf"

export default async function DiscoveryCategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }) {
  const { slug } = await params; const query = await searchParams; const requested = Number(query.page); const number = Number.isInteger(requested) && requested > 0 ? requested : 1
  const [navLinks, page] = await Promise.all([getNavLinks().catch(() => ({ genres: [], categories: [], menuPages: [] })), getDiscoveryCategory(slug, number)])
  return <div className="min-h-screen"><Header navLinks={navLinks} /><main className="site-shell pb-16 pt-24 sm:pt-28"><DiscoveryShelf title={slug.replace(/-/g, " ")} note="A dedicated crate from the FilmBase catalogue." items={page.items} page={page.page} hasNext={page.hasNext} basePath={`/discover/category/${slug}`} /></main><Footer /></div>
}
