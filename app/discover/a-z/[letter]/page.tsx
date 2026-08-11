import { notFound } from "next/navigation"
import { getAlphabeticalTitles, getNavLinks } from "@/lib/api"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DiscoveryShelf } from "@/components/discovery-shelf"
export default async function LetterPage({ params }: { params: Promise<{ letter: string }> }) { const { letter } = await params; if (!/^[a-z]$/i.test(letter)) notFound(); const [navLinks, page] = await Promise.all([getNavLinks().catch(() => ({ genres: [], categories: [], menuPages: [] })), getAlphabeticalTitles(letter)]); return <div className="min-h-screen"><Header navLinks={navLinks} /><main className="site-shell pb-16 pt-24 sm:pt-28"><DiscoveryShelf title={`Filed under ${letter.toUpperCase()}`} note="Alphabetical titles from the FilmBase paper index." items={page.items} /></main><Footer /></div> }
