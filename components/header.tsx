"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
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

export function Header({ navLinks }: { navLinks: NavLinks }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setSearchQuery("")
    }
  }

  // Prefer categories; fall back to menuPages if categories is empty
  const primaryLinks: Category[] =
    navLinks.categories.length > 0
      ? navLinks.categories
      : navLinks.menuPages.map((p) => ({ ...p, subCategories: [] }))

  // Genres dropdown (may be empty)
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

            {/* Genres dropdown — only shown when genres exist */}
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
              onClick={() => setIsSearchOpen(!isSearchOpen)}
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
          <div className="pb-4">
            <form onSubmit={handleSearch}>
              <Input
                type="search"
                placeholder="Search movies, series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                autoFocus
              />
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
