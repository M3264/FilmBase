import { getDiscoveryCategory, getNavLinks } from "@/lib/api"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DiscoveryShelf } from "@/components/discovery-shelf"
import { SeoBreadcrumbs } from "@/components/seo-breadcrumbs"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const title = slug.replace(/-/g, " ")
  return { title, description: `Browse ${title} titles on FilmBase.`, alternates: { canonical: `/discover/category/${slug}` } }
}

export default async function DiscoveryCategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }) {
  const { slug } = await params; const query = await searchParams; const requested = Number(query.page); const number = Number.isInteger(requested) && requested > 0 ? requested : 1
  const [navLinks, page] = await Promise.all([getNavLinks().catch(() => ({ genres: [], categories: [], menuPages: [] })), getDiscoveryCategory(slug, number)])
  const title = slug.replace(/-/g, " ")
  return <div className="min-h-screen"><Header navLinks={navLinks} /><main className="site-shell pb-16 pt-24 sm:pt-28"><SeoBreadcrumbs items={[{ name: "Home", href: "/" }, { name: "Discover", href: "/discover" }, { name: title }]} /><DiscoveryShelf title={title} note="A dedicated crate from the FilmBase catalogue." items={page.items} page={page.page} hasNext={page.hasNext} basePath={`/discover/category/${slug}`} /></main><Footer /></div>
}
import type { Metadata } from "next"
