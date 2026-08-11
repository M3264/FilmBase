import Link from "next/link"
import { getDiscoveryIndex, getNavLinks } from "@/lib/api"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdSlot } from "@/components/ad-slot"

export default async function DiscoverPage() {
  const [navLinks, fetchedIndex] = await Promise.all([
    getNavLinks().catch(() => ({ genres: [], categories: [], menuPages: [] })),
    getDiscoveryIndex().catch(() => null),
  ])
  const index = fetchedIndex ?? { collections: [{ id: "latest" as const, label: "Latest releases" }, { id: "trending" as const, label: "Trending" }, { id: "staff-picks" as const, label: "Staff picks" }], categories: [], letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("") }
  return (
    <div className="min-h-screen">
      <Header navLinks={navLinks} />
      <main className="site-shell pb-16 pt-24 sm:pt-28">
        <header className="grid gap-8 border-y border-border py-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
          <div><p className="eyebrow mb-4 text-primary">The back room / all doors open</p><h1 className="text-[clamp(3.4rem,12vw,9rem)] font-black leading-[.76] tracking-[-.075em]">Lucky<br />dip.</h1></div>
          <p className="border-l-4 border-primary pl-5 text-sm leading-7 text-muted-foreground">Browse by mood, shelf or first letter. No algorithmic prophecy—just useful ways into the FilmBase archive.</p>
        </header>
        <section className="py-10" aria-labelledby="collections"><div className="mb-5 flex items-end justify-between border-b-2 border-foreground pb-3"><div><p className="eyebrow text-primary">Start somewhere lively</p><h2 id="collections" className="mt-2 text-3xl font-black tracking-[-.04em]">Counter selections</h2></div><span className="data-type text-[10px] uppercase text-muted-foreground">03 crates</span></div><div className="grid border-l border-t border-border md:grid-cols-3">{index.collections.map((item, i) => <Link key={item.id} href={`/discover/${item.id}`} className="group min-h-48 border-b border-r border-border p-5 hover:bg-primary hover:text-primary-foreground"><span className="data-type text-xs">0{i + 1}</span><strong className="mt-16 flex items-end justify-between text-2xl tracking-[-.04em]"><span>{item.label}</span><span>↗</span></strong></Link>)}</div></section>
        <AdSlot placement="catalogue-top" />
        <section className="py-10" aria-labelledby="categories"><div className="mb-5 border-b-2 border-foreground pb-3"><p className="eyebrow text-primary">Named crates</p><h2 id="categories" className="mt-2 text-3xl font-black tracking-[-.04em]">Browse by shelf</h2></div><div className="grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3">{index.categories.map((item, i) => <Link key={item.id} href={`/discover/category/${item.id}`} className="flex min-h-16 items-center justify-between gap-3 border-b border-r border-border px-4 py-3 text-sm font-semibold hover:bg-secondary"><span><small className="mr-3 data-type text-[9px] text-primary">{String(i + 1).padStart(2, "0")}</small>{item.label}</span><span>→</span></Link>)}</div></section>
        <section className="py-10"><div className="mb-5 border-b-2 border-foreground pb-3"><p className="eyebrow text-primary">Old-school index</p><h2 className="mt-2 text-3xl font-black tracking-[-.04em]">A to Z</h2></div><div className="grid grid-cols-7 border-l border-t border-border sm:grid-cols-13">{index.letters.map((letter) => <Link key={letter} href={`/discover/a-z/${letter.toLowerCase()}`} className="grid aspect-square place-items-center border-b border-r border-border data-type text-xs font-bold hover:bg-foreground hover:text-background">{letter}</Link>)}</div></section>
      </main>
      <Footer />
    </div>
  )
}
