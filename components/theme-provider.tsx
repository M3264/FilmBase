"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"
type ThemeProviderState = { theme: Theme; setTheme: (theme: Theme) => void }

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({ children, storageKey = "filmbase-theme" }: { children: React.ReactNode; defaultTheme?: Theme; storageKey?: string }) {
  const [theme, setThemeState] = useState<Theme>("dark")

  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null
    const resolved = stored ?? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(resolved)
    setThemeState(resolved)
  }, [storageKey])

  const setTheme = (next: Theme) => {
    localStorage.setItem(storageKey, next)
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(next)
    setThemeState(next)
  }

  return <ThemeProviderContext.Provider value={{ theme, setTheme }}>{children}</ThemeProviderContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (!context) throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
