import "server-only"

import { randomInt, timingSafeEqual } from "node:crypto"
import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import { dirname } from "node:path"
import { SITE_URL } from "@/lib/site-url"
import { inferContentType, type ContentType } from "@/lib/domain/catalog"

type AlertKind = "filmbase_new" | "tmdb_theatrical" | "tmdb_digital"
export type AlertEvent = {
  id: string
  kind: AlertKind
  title: string
  contentType: ContentType
  poster: string | null
  date: string
  source: "FilmBase" | "TMDB"
  url: string
  availableOnFilmBase: boolean
  publishedAt: string
}
type Pick = { title: string; poster: string | null; url: string; contentType: "movie"; source: "FilmBase" }
type FeedTitle = { id: string; title: string; type?: ContentType; imageUrl?: string | null; providers?: Array<{ provider: string; id: string }> }
type State = { version: 1; sequence: number; events: AlertEvent[]; seen: Record<string, string>; movies: Pick[]; daily: { date: string; pick: Pick } | null; tmdbThrough: string | null }
const empty = (): State => ({ version: 1, sequence: 0, events: [], seen: {}, movies: [], daily: null, tmdbThrough: null })
const statePath = () => process.env.FILMBASE_ALERTS_FILE || "/app/data/alerts.json"
const day = (date: Date) => date.toISOString().slice(0, 10)
const cutoff = (date: Date) => new Date(date.getTime() - 30 * 86400000).toISOString()
const api2 = () => process.env.FILMBASE_API2_URL || "https://api2.filmbase.fun"

export async function readAlerts(): Promise<State> {
  try {
    const value = JSON.parse(await readFile(statePath(), "utf8")) as State
    if (value.version !== 1 || !Array.isArray(value.events) || !value.seen || !Array.isArray(value.movies)) throw new Error("Invalid alerts state")
    return value
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return empty()
    throw error
  }
}
async function save(state: State) {
  const path = statePath()
  await mkdir(dirname(path), { recursive: true })
  const temp = `${path}.${process.pid}.tmp`
  await writeFile(temp, JSON.stringify(state), { mode: 0o600 })
  await rename(temp, path)
}
export function authorized(header: string | null): boolean {
  const secret = process.env.FILMBASE_ALERTS_SYNC_SECRET
  if (!secret || !header?.startsWith("Bearer ")) return false
  const provided = Buffer.from(header.slice(7))
  const expected = Buffer.from(secret)
  return provided.length === expected.length && timingSafeEqual(provided, expected)
}
function append(state: State, event: Omit<AlertEvent, "id" | "publishedAt">, now: Date) {
  state.sequence++
  state.events.push({ ...event, id: String(state.sequence), publishedAt: now.toISOString() })
}
function filmPath(title: FeedTitle): string | null {
  const ref = title.providers?.find((item) => item.provider === "ninejarocks" && /^\d+$/.test(item.id))
  return ref ? `${SITE_URL}/movie/fb-${ref.id}` : null
}
async function fetchFilmBase(): Promise<FeedTitle[]> {
  const response = await fetch(`${api2()}/v1/catalog?category=latest`, { cache: "no-store", signal: AbortSignal.timeout(15000) })
  if (!response.ok) throw new Error(`FilmBase feed returned ${response.status}`)
  const body = await response.json() as { data?: FeedTitle[] }
  if (!Array.isArray(body.data) || !body.data.length || !body.data.some((item) => filmPath(item))) throw new Error("FilmBase feed is empty or invalid")
  return body.data
}
function syncFilmBase(state: State, feed: FeedTitle[], now: Date): number {
  const initial = !Object.keys(state.seen).some((key) => key.startsWith("ninejarocks:"))
  let added = 0
  const movies: Pick[] = []
  for (const item of [...feed].reverse()) {
    const path = filmPath(item)
    if (!path || !item.title?.trim() || !item.id) continue
    const type = inferContentType(item.title, item.type || "")
    if (type === "movie") movies.push({ title: item.title, poster: item.imageUrl || null, url: path, contentType: "movie", source: "FilmBase" })
    if (state.seen[item.id]) continue
    state.seen[item.id] = now.toISOString()
    if (initial) continue
    append(state, { kind: "filmbase_new", title: item.title, contentType: type, poster: item.imageUrl || null, date: day(now), source: "FilmBase", url: path, availableOnFilmBase: true }, now)
    added++
  }
  state.movies = movies.reverse()
  return added
}

type TmdbMovie = { id: number; title: string; poster_path: string | null; popularity: number }
type TmdbRelease = { results?: Array<{ release_dates?: Array<{ type: number; release_date: string }> }> }
async function tmdb(path: string): Promise<unknown> {
  const token = process.env.TMDB_API_READ_TOKEN || process.env.TMDB_READ_ACCESS_TOKEN || process.env.TMDB_API_TOKEN
  if (!token) throw new Error("TMDB token is not configured")
  const response = await fetch(`${process.env.FILMBASE_TMDB_API_URL || "https://api.themoviedb.org/3"}${path}`, {
    headers: { Authorization: `Bearer ${token}`, accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) throw new Error(`TMDB returned ${response.status}`)
  return response.json()
}
async function syncTmdbDay(state: State, target: string, now: Date): Promise<number> {
  let count = 0
  for (const group of [
    { kind: "tmdb_theatrical" as const, types: [2, 3], query: "2|3" },
    { kind: "tmdb_digital" as const, types: [4], query: "4" },
  ]) {
    const query = new URLSearchParams({ "release_date.gte": target, "release_date.lte": target, with_release_type: group.query, sort_by: "popularity.desc", include_adult: "false", page: "1" })
    const data = await tmdb(`/discover/movie?${query}`) as { results?: TmdbMovie[] }
    if (!Array.isArray(data.results)) throw new Error("TMDB discover response is invalid")
    const candidates = data.results.slice(0, 20)
    for (let index = 0; index < candidates.length; index += 5) {
      const batch = candidates.slice(index, index + 5)
      const releases = await Promise.all(batch.map((movie) => tmdb(`/movie/${movie.id}/release_dates`) as Promise<TmdbRelease>))
      if (releases.some((release) => !Array.isArray(release.results))) throw new Error("TMDB release dates response is invalid")
      for (const [offset, movie] of batch.entries()) {
        const dates = (releases[offset].results || []).flatMap((region) => region.release_dates || [])
          .filter((release) => group.types.includes(release.type) && /^\d{4}-\d{2}-\d{2}/.test(release.release_date))
          .map((release) => release.release_date.slice(0, 10)).sort()
        if (dates[0] !== target) continue
        const key = `${group.kind}:${movie.id}:${target}`
        if (state.seen[key]) continue
        state.seen[key] = now.toISOString()
        append(state, { kind: group.kind, title: movie.title, contentType: "movie", poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null, date: target, source: "TMDB", url: `https://www.themoviedb.org/movie/${movie.id}`, availableOnFilmBase: false }, now)
        count++
      }
    }
  }
  return count
}
let running = false
export async function synchronize(now = new Date()) {
  if (running) throw new Error("A sync is already running")
  running = true
  try {
    const state = await readAlerts()
    const result = { filmbase: 0, tmdb: 0, errors: [] as string[] }
    try {
      const feed = await fetchFilmBase()
      result.filmbase = syncFilmBase(state, feed, now)
      await save(state)
    } catch (error) { result.errors.push(`FilmBase: ${(error as Error).message}`) }
    if (process.env.TMDB_API_READ_TOKEN || process.env.TMDB_READ_ACCESS_TOKEN || process.env.TMDB_API_TOKEN) {
      const today = day(now)
      const next = state.tmdbThrough ? day(new Date(Date.parse(`${state.tmdbThrough}T00:00:00Z`) + 86400000)) : today
      if (next <= today) {
        try {
          result.tmdb = await syncTmdbDay(state, next, now)
          state.tmdbThrough = next
          await save(state)
        } catch (error) { result.errors.push(`TMDB: ${(error as Error).message}`) }
      }
    } else result.errors.push("TMDB: token is not configured")
    const threshold = cutoff(now)
    state.events = state.events.filter((event) => event.publishedAt >= threshold)
    state.seen = Object.fromEntries(Object.entries(state.seen).filter(([key, seenAt]) => key.startsWith("ninejarocks:") || seenAt >= threshold))
    if (state.movies.length && state.daily?.date !== day(now)) state.daily = dailyPick(state, now)
    await save(state)
    return { ...result, cursor: String(state.sequence), tmdbThrough: state.tmdbThrough }
  } finally { running = false }
}
export function eventsAfter(state: State, after: string | null, limit = 50) {
  const cursor = after === null || after === "" ? 0 : Number(after)
  if (!Number.isSafeInteger(cursor) || cursor < 0) throw new Error("Invalid cursor")
  const events = state.events.filter((event) => Number(event.id) > cursor).slice(0, limit)
  return { events, cursor: events.at(-1)?.id || String(Math.max(cursor, state.sequence)), hasMore: state.events.some((event) => Number(event.id) > Number(events.at(-1)?.id || cursor)), retainedSince: state.events[0]?.id || null }
}
export function dailyPick(state: State, now = new Date()): { date: string; pick: Pick } | null {
  const date = day(now)
  if (state.daily?.date === date) return state.daily
  if (!state.movies.length) return null
  const hash = [...date].reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 0)
  return { date, pick: state.movies[hash % state.movies.length] }
}
export function randomPick(state: State): Pick | null { return state.movies.length ? state.movies[randomInt(state.movies.length)] : null }
