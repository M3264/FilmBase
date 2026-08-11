import { getNavLinks } from "@/lib/api"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimeGrid } from "@/components/anime-grid"
import { AdSlot } from "@/components/ad-slot"

export default async function AnimePage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const navLinks = await getNavLinks().catch(() => ({ genres: [], categories: [], menuPages: [] }))
  const query = await searchParams
  const requested = Number(query.page)
  const page = Number.isInteger(requested) && requested > 0 ? requested : 1

  return (
    <div className="min-h-screen">
      <Header navLinks={navLinks} />

      <main className="site-shell pt-24 pb-14 sm:pt-28">
        <header className="relative overflow-hidden border-y border-border py-8 sm:py-11">
          <div aria-hidden="true" className="absolute right-0 top-0 hidden h-full w-28 grid-cols-4 border-l border-border opacity-50 sm:grid">
            {Array.from({ length: 20 }).map((_, index) => (
              <span key={index} className={index % 3 === 0 ? "bg-primary" : "border-b border-l border-border"} />
            ))}
          </div>
          <div className="relative max-w-3xl sm:pr-36">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center bg-primary data-type text-xs font-bold text-primary-foreground">12</span>
              <p className="eyebrow text-primary">FilmBase after-hours channel</p>
            </div>
            <h1 className="text-[clamp(3.8rem,14vw,8rem)] font-black leading-[.76] tracking-[-.075em]">
              Anime<br /><span className="text-primary">after dark.</span>
            </h1>
            <p className="mt-7 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              The currently airing board: new episodes, cult discoveries and late-night animation, filed as they arrive.
            </p>
          </div>
        </header>

        <div className="my-8"><AdSlot placement="catalogue-top" compact /></div>

        <AnimeGrid page={page} />
      </main>

      <Footer />
    </div>
  )
}
