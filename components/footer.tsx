import Link from "next/link"

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="border-b border-border bg-primary/10">
        <div className="site-shell py-3 text-center text-xs font-semibold text-foreground">
          FilmBase is now ad-free. No pop-ups, injected scripts, or interruptions.
        </div>
      </div>
      <div className="site-shell grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div><p className="display-type text-3xl font-black uppercase tracking-[-.05em]">FilmBase</p><p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">Movies, series and anime organised for quick discovery and straightforward downloads.</p></div>
        <div><p className="eyebrow mb-4 text-muted-foreground">Browse</p><div className="grid gap-3 text-sm"><Link href="/search">Request desk</Link><Link href="/discover">Lucky dip</Link><Link href="/discover/a-z">A–Z archive</Link><a href="/downloads/FilmBase.apk" download>Get the Android app ↘</a></div></div>
        <div><p className="eyebrow mb-4 text-muted-foreground">Collections</p><div className="grid gap-3 text-sm"><Link href="/discover/latest">Fresh returns</Link><Link href="/discover/trending">Passing around</Link><Link href="/anime">Anime after dark</Link></div></div>
      </div>
      <div className="border-t border-border"><div className="site-shell flex flex-col justify-between gap-2 py-5 data-type text-[10px] uppercase text-muted-foreground sm:flex-row"><span>© {new Date().getFullYear()} FilmBase</span><span>Posters, metadata and explicit external offers</span></div></div>
    </footer>
  )
}
