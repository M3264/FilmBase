"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Search, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"

interface Category {
  name: string
  path: string
  subCategories?: Array<{ name: string; path: string }>
}

interface NavLinks {
  genres: Array<{ name: string; path: string }>
  categories: Category[]
  menuPages: Array<{ name: string; path: string }>
}

interface Suggestion {
  title: string
  path: string
  image?: string
}

export function Header({ navLinks }: { navLinks: NavLinks }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchWrapperRef = useRef<HTMLDivElement>(null)

  // Fetch suggestions with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true)
      try {
        const res = await fetch(
  `https://api.filmbase.fun/api/search?query=${encodeURIComponent(searchQuery.trim())}&page=1`
  )
  const data = await res.json()
  
  const items: Suggestion[] = (data?.data?.items ?? []).slice(0, 6).map((item: any) => ({
  title: item.title ?? "",
  path: item.path ?? "",
  image: item.imageUrl ?? null,
}))
        setSuggestions(items)
        setShowSuggestions(items.length > 0)
      } catch {
        setSuggestions([])
        setShowSuggestions(false)
      } finally {
        setIsLoadingSuggestions(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery])

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery("")
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (path: string) => {
    router.push(`/${path}`)
    setIsSearchOpen(false)
    setSearchQuery("")
    setSuggestions([])
    setShowSuggestions(false)
  }

  // Prefer categories; fall back to menuPages if categories is empty
  const primaryLinks: Category[] =
    navLinks.categories.length > 0
      ? navLinks.categories
      : navLinks.menuPages.map((p) => ({ ...p, subCategories: [] }))

  const hasGenres = navLinks.genres.length > 0

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            FilmBase<span className="text-primary">.</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {primaryLinks.map((item) => (
              <Link
                key={item.path}
                href={`/${item.path}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}

            {hasGenres && (
              <div className="relative group">
                <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Genres
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-2 grid gap-1">
                    {navLinks.genres.slice(0, 10).map((genre) => (
                      <Link
                        key={genre.path}
                        href={`/${genre.path}`}
                        className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsSearchOpen(!isSearchOpen)
                if (isSearchOpen) {
                  setSearchQuery("")
                  setSuggestions([])
                  setShowSuggestions(false)
                }
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Search bar */}
        {isSearchOpen && (
          <div className="pb-4" ref={searchWrapperRef}>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="search"
                  placeholder="Search movies, series, anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className="w-full"
                  autoFocus
                />

                {/* Suggestions dropdown */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                    {isLoadingSuggestions ? (
                      <div className="px-4 py-3 text-sm text-muted-foreground">Loading...</div>
                    ) : (
                      suggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSuggestionClick(s.path)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary transition-colors"
                        >
                          {s.image && (
                            <img
                              src={s.image}
                              alt=""
                              className="w-8 h-12 object-cover rounded flex-shrink-0"
                            />
                          )}
                          <span className="text-sm font-medium line-clamp-1">{s.title}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Visible Enter/Search button */}
              <Button type="submit" disabled={!searchQuery.trim()}>
                <Search className="h-4 w-4 mr-1.5" />
                Search
              </Button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {primaryLinks.map((item) => (
              <Link
                key={item.path}
                href={`/${item.path}`}
                className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {hasGenres && (
              <>
                <div className="px-4 py-2 text-sm font-medium text-foreground">Genres</div>
                {navLinks.genres.map((genre) => (
                  <Link
                    key={genre.path}
                    href={`/${genre.path}`}
                    className="block px-8 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {genre.name}
                  </Link>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
