import { notFound } from "next/navigation"
import { discoveryCollectionIds, type DiscoveryCollectionId } from "@/lib/domain/catalog"
import { getDiscoveryCollection, getNavLinks } from "@/lib/api"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DiscoveryShelf } from "@/components/discovery-shelf"
import { SeoBreadcrumbs } from "@/components/seo-breadcrumbs"

const names: Record<DiscoveryCollectionId, [string, string]> = { latest: ["Fresh returns", "The newest titles to reach the counter."], trending: ["Passing around", "Titles currently moving fastest through the archive."], "staff-picks": ["Clerk's pocket", "A small shelf of picks worth a closer look."] }
export async function generateMetadata({ params }: { params: Promise<{ collection: string }> }): Promise<Metadata> {
  const { collection } = await params
  if (!discoveryCollectionIds.includes(collection as DiscoveryCollectionId)) return {}
  const [title, description] = names[collection as DiscoveryCollectionId]
  return { title, description, alternates: { canonical: `/discover/${collection}` } }
}
export default async function CollectionPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params
  if (!discoveryCollectionIds.includes(collection as DiscoveryCollectionId)) notFound()
  const [navLinks, page] = await Promise.all([getNavLinks().catch(() => ({ genres: [], categories: [], menuPages: [] })), getDiscoveryCollection(collection as DiscoveryCollectionId)])
  const [title, note] = names[collection as DiscoveryCollectionId]
  return <div className="min-h-screen"><Header navLinks={navLinks} /><main className="site-shell pb-16 pt-24 sm:pt-28"><SeoBreadcrumbs items={[{ name: "Home", href: "/" }, { name: "Discover", href: "/discover" }, { name: title }]} /><DiscoveryShelf title={title} note={note} items={page.items} /></main><Footer /></div>
}
import type { Metadata } from "next"
