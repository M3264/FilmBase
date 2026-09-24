import type { Metadata } from "next"
import { searchMovies, getNavLinks, searchAnime } from "@/lib/api"
import { Header } from "@/components/header"
import { MovieCard } from "@/components/movie-card"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { SearchForm } from "@/components/search-form"
import { publicAnimeImageUrl } from "@/lib/presentation-images"

export const metadata: Metadata = { title: "Search", alternates: { canonical: "/search" } }

const proxyImage = publicAnimeImageUrl

interface AnimeSearchItem {
  id: string
  title?: string
  image?: string
  type?: string
  release_date?: string
}

function animeSearchItems(value: unknown): AnimeSearchItem[] {
  const candidate = Array.isArray(value)
    ? value
    : typeof value === "object" && value !== null && "data" in value
      ? (value as { data?: unknown }).data
      : []
  return Array.isArray(candidate) ? candidate.filter((item): item is AnimeSearchItem => typeof item === "object" && item !== null && "id" in item) : []
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; tab?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const query = resolvedSearchParams.q?.trim() || ""
  const requestedPage = Number.parseInt(resolvedSearchParams.page || "1", 10)
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const tab = resolvedSearchParams.tab === "anime" ? "anime" : "movies"
  const navLinks = await getNavLinks()

  if (!query) {
    return (
      <div className="min-h-screen">
        <Header navLinks={navLinks} />
        <main className="site-shell pb-16 pt-24 sm:pt-28">
          <section className="border-y border-border py-8 sm:py-12">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
              <div>
                <p className="eyebrow mb-4 text-primary">FilmBase programme / Request desk</p>
                <h1 className="text-[clamp(3.4rem,13vw,8rem)] font-black leading-[.8] tracking-[-.07em]">Find a<br />picture.</h1>
              </div>
              <div className="border-l-4 border-primary pl-5">
                <p className="data-type text-[10px] uppercase text-muted-foreground">Search transmission</p>
                <p className="mt-3 text-sm leading-6">Ask for a title, performer, genre, or series. We will check the movie and anime shelves.</p>
              </div>
            </div>
          </section>
          <section className="py-8 sm:py-12" aria-labelledby="search-prompt">
            <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-border pb-3">
              <h2 id="search-prompt" className="eyebrow text-muted-foreground">Type your request</h2>
              <span className="data-type text-[9px] uppercase text-muted-foreground">Catalogue line / Open</span>
            </div>
            <SearchForm />
            <p className="mt-4 text-xs leading-5 text-muted-foreground">Try a complete title for the quickest match. Short terms may return a wider programme.</p>
          </section>
          <Link href="/" className="eyebrow inline-block border-b border-foreground pb-1 outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background">← Return to the front desk</Link>
        </main>
        <Footer />
      </div>
    )
  }

  const [movieResults, animeResults] = await Promise.all([
    searchMovies(query, page).catch(() => null),
    searchAnime(query).catch(() => null),
  ])
  const animeItems = animeSearchItems(animeResults)
  const activeCount = tab === "movies" ? movieResults?.items.length || 0 : animeItems.length

  return (
    <div className="min-h-screen">
      <Header navLinks={navLinks} />
      <main className="site-shell pb-16 pt-24 sm:pt-28">
        <header className="border-y border-border py-7 sm:py-10">
          <p className="eyebrow mb-4 text-primary">FilmBase request / Results received</p>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
            <div className="min-w-0">
              <p className="data-type mb-2 text-[10px] uppercase text-muted-foreground">You asked for</p>
              <h1 className="break-words text-[clamp(2.8rem,9vw,6.5rem)] font-black leading-[.86] tracking-[-.06em]">{query}</h1>
            </div>
            <div>
              <SearchForm initialQuery={query} compact />
            </div>
          </div>
        </header>

        <div className="mb-8 grid border-b border-border sm:grid-cols-[1fr_1fr_auto]">
          <Link
            href={`/search?q=${encodeURIComponent(query)}&tab=movies`}
            aria-current={tab === "movies" ? "page" : undefined}
            className={`flex min-h-14 items-center justify-between border-b border-border px-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:border-b-0 sm:border-r ${tab === "movies" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
          >
            <span>Movies &amp; series</span><span className="data-type text-[10px]">{String(movieResults?.items.length || 0).padStart(2, "0")}</span>
          </Link>
          <Link
            href={`/search?q=${encodeURIComponent(query)}&tab=anime`}
            aria-current={tab === "anime" ? "page" : undefined}
            className={`flex min-h-14 items-center justify-between border-b border-border px-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:border-b-0 sm:border-r ${tab === "anime" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
          >
            <span>Anime</span><span className="data-type text-[10px]">{String(animeItems.length).padStart(2, "0")}</span>
          </Link>
          <span className="flex min-h-10 items-center px-4 data-type text-[9px] uppercase text-muted-foreground sm:min-h-14">{activeCount} matches / active shelf</span>
        </div>

        {tab === "movies" && (
          movieResults?.items.length ? (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:gap-x-7">
                {movieResults.items.map((movie, index) => <MovieCard key={`${movie.path}-${index}`} movie={movie} index={index} />)}
              </div>
              {movieResults.totalPages > 1 && (
                <nav className="mt-12 grid border-y border-border sm:grid-cols-[1fr_auto_1fr]" aria-label="Movie search pages">
                  {page > 1 ? <Link href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}&tab=movies`} className="flex min-h-16 items-center justify-center border-b border-border px-5 text-sm font-semibold outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:justify-start sm:border-b-0">← Previous reel</Link> : <span />}
                  <span className="order-first flex min-h-12 items-center justify-center border-b border-border px-7 data-type text-[10px] uppercase text-muted-foreground sm:order-none sm:border-x sm:border-b-0">Page {movieResults.currentPage} of {movieResults.totalPages}</span>
                  {page < movieResults.totalPages ? <Link href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}&tab=movies`} className="flex min-h-16 items-center justify-center px-5 text-sm font-semibold outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:justify-end">Next reel →</Link> : <span />}
                </nav>
              )}
            </>
          ) : <EmptyResult query={query} alternateHref={`/search?q=${encodeURIComponent(query)}&tab=anime`} alternateLabel="Check the anime shelf" />
        )}

        {tab === "anime" && (
          animeItems.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:gap-x-7">
              {animeItems.map((anime, index) => <MovieCard key={`${anime.id}-${index}`} index={index} movie={{ title: anime.title || "Untitled anime", path: `__anime/${encodeURIComponent(anime.id)}`, imageUrl: proxyImage(anime.image) || "", categories: [anime.type || "Anime"], date: anime.release_date || null }} />)}
            </div>
          ) : <EmptyResult query={query} alternateHref={`/search?q=${encodeURIComponent(query)}&tab=movies`} alternateLabel="Check movies & series" />
        )}
      </main>
      <Footer />
    </div>
  )
}

function EmptyResult({ query, alternateHref, alternateLabel }: { query: string; alternateHref: string; alternateLabel: string }) {
  return (
    <section className="grid min-h-64 place-items-center border-y border-border py-12 text-center">
      <div>
        <p className="eyebrow text-primary">No match on this shelf</p>
        <h2 className="display-type mt-3 text-4xl font-black uppercase tracking-[-.04em]">Nothing filed under “{query}”</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Try a shorter spelling, or switch shelves to widen the request.</p>
        <Link href={alternateHref} className="mt-6 inline-flex min-h-11 items-center border-2 border-foreground px-5 text-sm font-semibold outline-none hover:bg-foreground hover:text-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background">{alternateLabel} →</Link>
      </div>
    </section>
  )
}
