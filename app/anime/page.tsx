import { getNavLinks } from "@/lib/api"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Script from "next/script"
import { AnimeGrid } from "@/components/anime-grid"

export default async function AnimePage() {
  const navLinks = await getNavLinks().catch(() => [])

  return (
    <div className="min-h-screen">
      <Header navLinks={navLinks} />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">🎌 Anime</h1>
          <p className="text-muted-foreground">Currently airing anime</p>
        </div>

        <div className="w-full mb-8">
          <div id="container-aadc53e5aa579316a6819840d149ca4b" />
        </div>

        {/* Client component handles fetching + pagination */}
        <AnimeGrid />
      </main>

      <Footer />
    </div>
  )
}
