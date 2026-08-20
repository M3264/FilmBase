import { notFound } from "next/navigation"
import { getNavLinks, getGenreMovies } from "@/lib/api"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CatalogView } from "@/components/catalog-view"

function cleanTitle(title: string): string {
  return title
    .replace(/\s*-\s*nkiri\s*/gi, "")
    .replace(/\s*nkiri\s*/gi, "")
    .replace(/\s+archives\s*/gi, "")
    .trim()
}

export default async function SlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ path: string[] }>
  searchParams: Promise<{ page?: string }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const navLinks = await getNavLinks()

  if (!resolvedParams.path || resolvedParams.path.length === 0) {
    notFound()
  }

  const fullPath = resolvedParams.path.join("/")
  const requestedPage = Number.parseInt(resolvedSearchParams.page || "1", 10)
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1

  try {
    const genreData = await getGenreMovies(`category/${fullPath}`, currentPage)

    if (!genreData || !genreData.items) {
      notFound()
    }

    const cleanedTitle = cleanTitle(genreData.listTitle)

    return (
      <div className="min-h-screen">
        <Header navLinks={navLinks} />

        <main className="site-shell pb-16 pt-24 sm:pt-28">
          <header className="mb-8 border-y border-border">
            <div className="grid min-h-[15rem] gap-8 py-7 md:grid-cols-[minmax(0,1fr)_15rem] md:items-end md:py-10">
              <div className="min-w-0">
                <p className="eyebrow mb-4 text-primary">FilmBase programme / Catalogue shelf</p>
                <h1 className="break-words text-[clamp(2.8rem,9vw,6.5rem)] font-black leading-[.86] tracking-[-.06em]">
                  {cleanedTitle}
                </h1>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="data-type text-[10px] uppercase leading-5 text-muted-foreground">Broadcast index</p>
                <p className="display-type mt-1 text-4xl font-black uppercase">{String(genreData.currentPage).padStart(2, "0")}<span className="text-muted-foreground">/{String(genreData.totalPages).padStart(2, "0")}</span></p>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">A poster-led shelf from the FilmBase circulation desk.</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-between gap-2 border-t border-border py-3 data-type text-[9px] uppercase text-muted-foreground sm:text-[10px]">
              <span>{genreData.items.length} titles received</span>
              <span>Channel / {fullPath.replaceAll("/", " · ")}</span>
              <span>Updated catalogue feed</span>
            </div>
          </header>

          <CatalogView items={genreData.items} />

          {genreData.totalPages > 1 && (
            <nav className="mt-12 grid border-y border-border sm:grid-cols-[1fr_auto_1fr]" aria-label="Catalogue pages">
              {currentPage > 1 && (
                <a
                  href={`/category/${fullPath}?page=${currentPage - 1}`}
                  className="flex min-h-16 items-center justify-center border-b border-border px-5 text-sm font-semibold outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:justify-start sm:border-b-0"
                >
                  ← Previous reel
                </a>
              )}
              <span className="order-first flex min-h-12 items-center justify-center border-b border-border px-7 data-type text-[10px] uppercase text-muted-foreground sm:order-none sm:border-x sm:border-b-0">Page {genreData.currentPage} of {genreData.totalPages}</span>
              {currentPage < genreData.totalPages && (
                <a
                  href={`/category/${fullPath}?page=${currentPage + 1}`}
                  className="flex min-h-16 items-center justify-center px-5 text-sm font-semibold outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:justify-end"
                >
                  Next reel →
                </a>
              )}
            </nav>
          )}
        </main>

        <Footer />
      </div>
    )
  } catch (error) {
    console.error("[SlugPage] Error loading page:", fullPath, error)
    notFound()
  }
}
