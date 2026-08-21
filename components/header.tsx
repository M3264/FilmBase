"use client"

import type React from "react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Menu, Search, X } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { displayTitle, publicMoviePath } from "@/lib/presentation"

interface Category { name: string; path: string; subCategories?: Array<{ name: string; path: string }> }
interface NavLinks { genres: Array<{ name: string; path: string }>; categories: Category[]; menuPages: Array<{ name: string; path: string }> }
interface Suggestion { title: string; path: string; year?: number; type?: string }

const fixedShelves = [
  { number: "01", label: "Front desk", short: "Home", href: "/", match: (path: string) => path === "/" },
  { number: "02", label: "Films", short: "Films", href: "/discover/category/hollywood-movie", match: (path: string) => path.includes("hollywood-movie") || path.startsWith("/movie/") },
  { number: "03", label: "Series", short: "Series", href: "/discover/category/hollywood-tv-series", match: (path: string) => path.includes("tv-series") },
  { number: "04", label: "Anime", short: "Anime", href: "/anime", match: (path: string) => path.startsWith("/anime") },
  { number: "05", label: "Lucky dip", short: "Lucky", href: "/discover", match: (path: string) => path === "/discover" },
  { number: "06", label: "A–Z index", short: "A–Z", href: "/discover/a-z", match: (path: string) => path.startsWith("/discover/a-z") },
]

export function Header({ navLinks }: { navLinks: NavLinks }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [shelvesOpen, setShelvesOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [navigationPending, setNavigationPending] = useState(false)
  const navigationStarted = useRef<number | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current)
    if (query.trim().length < 2) { setSuggestions([]); return }
    debounce.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/v1/search?q=${encodeURIComponent(query.trim())}&page=1&pageSize=6`)
        const json = await response.json()
        setSuggestions((json?.data ?? []).map((item: { title: string; publicPath?: string; path?: string; year?: number; type?: string }) => ({ title: item.title, path: item.publicPath || item.path || "", year: item.year, type: item.type })).filter((item: Suggestion) => item.path))
      } catch { setSuggestions([]) }
    }, 300)
    return () => { if (debounce.current) clearTimeout(debounce.current) }
  }, [query])

  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); setSearchOpen(false); setShelvesOpen(false) } }
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [])

  useEffect(() => {
    setMenuOpen(false); setSearchOpen(false); setShelvesOpen(false)
    const started = navigationStarted.current
    if (!started) { setNavigationPending(false); return }
    const remaining = Math.max(0, 420 - (performance.now() - started))
    const timer = window.setTimeout(() => { setNavigationPending(false); navigationStarted.current = null }, remaining)
    return () => window.clearTimeout(timer)
  }, [pathname])

  const beginNavigation = () => { navigationStarted.current = performance.now(); setNavigationPending(true) }
  const search = (event: React.FormEvent) => { event.preventDefault(); if (query.trim()) { beginNavigation(); router.push(`/search?q=${encodeURIComponent(query.trim())}`) } }

  const handleNavigationClick = (event: React.MouseEvent<HTMLElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const link = (event.target as HTMLElement).closest("a")
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return
    const url = new URL(link.href, window.location.href)
    if (url.origin === window.location.origin && url.pathname !== pathname) beginNavigation()
  }

  return (
    <header className="archive-header" data-navigation-pending={navigationPending || undefined} onClick={handleNavigationClick} aria-busy={navigationPending || undefined}>
      {navigationPending ? <span className="archive-nav-progress" aria-hidden="true" /> : null}
      {navigationPending ? <span className="archive-nav-status" role="status">Opening shelf <i aria-hidden="true" /></span> : null}
      <div className="site-shell archive-header-main">
        <Link href="/" className="archive-brand" aria-label="FilmBase home">
          <span className="archive-brand-stamp">FB</span>
          <span><b>FilmBase</b><small>Neighbourhood archive</small></span>
        </Link>

        <nav className="archive-rail archive-rail-desktop" aria-label="Shelf rail">
          {fixedShelves.map((item) => <ShelfLink key={item.href} item={item} pathname={pathname} />)}
          <button type="button" className={shelvesOpen ? "active" : ""} onClick={() => setShelvesOpen(value => !value)} aria-expanded={shelvesOpen} aria-controls="browse-shelves"><span>07</span><b>Browse shelves</b></button>
        </nav>

        <div className="archive-tools">
          <ThemeToggle />
          <button type="button" onClick={() => setSearchOpen(value => !value)} aria-label="Open request desk" aria-expanded={searchOpen} aria-controls="archive-search"><Search /></button>
          <button type="button" onClick={() => setMenuOpen(value => !value)} aria-label="Open full archive index" aria-expanded={menuOpen} aria-controls="archive-menu"><span className="data-type">INDEX</span>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>

      <div className="archive-rail archive-rail-mobile site-shell" aria-label="Mobile shelf rail">
        {fixedShelves.map((item) => <ShelfLink key={item.href} item={item} pathname={pathname} compact />)}
      </div>

      {shelvesOpen && <nav id="browse-shelves" className="archive-shelf-panel site-shell" aria-label="Browse all shelves">{navLinks.categories.slice(0, 18).map((item, index) => <Link key={item.path} href={`/${item.path}`}><span>{String(index + 1).padStart(2, "0")}</span><b>{item.name}</b><i>→</i></Link>)}</nav>}

      {searchOpen && <div id="archive-search" className="archive-search"><form onSubmit={search} className="site-shell"><span className="archive-search-tag">Request slip</span><label className="sr-only" htmlFor="global-search">Search FilmBase</label><input id="global-search" autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a title, actor or country…" /><button>Search archive ↗</button>{suggestions.length > 0 && <div className="archive-suggestions">{suggestions.map((item, index) => <Link key={`${item.path}-${index}`} href={`/movie/${publicMoviePath(item.path)}`}><span>{String(index + 1).padStart(2, "0")}</span><b>{displayTitle(item.title)}</b><small>{[item.type, item.year].filter(Boolean).join(" · ") || "Title file"}</small></Link>)}</div>}</form></div>}

      {menuOpen && <nav id="archive-menu" className="archive-menu site-shell" aria-label="Full archive index"><div><p className="eyebrow">Browse</p>{navLinks.categories.map((item, index) => <Link key={item.path} href={`/${item.path}`}><span>{String(index + 1).padStart(2, "0")}</span>{item.name}<b>→</b></Link>)}</div><div><p className="eyebrow">Archive rooms</p>{fixedShelves.map(item => <Link key={item.href} href={item.href}><span>{item.number}</span>{item.label}<b>→</b></Link>)}<Link href="/search"><span>07</span>Request desk<b>→</b></Link></div></nav>}
    </header>
  )
}

function ShelfLink({ item, pathname, compact = false }: { item: typeof fixedShelves[number]; pathname: string; compact?: boolean }) {
  const active = item.match(pathname)
  return <Link href={item.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}><span>{item.number}</span><b>{compact ? item.short : item.label}</b></Link>
}
