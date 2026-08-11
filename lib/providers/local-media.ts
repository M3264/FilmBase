import type { CatalogTitle, SourceOffer } from "@/lib/domain/catalog"

const MEDIA_BASE = process.env.FILMBASE_MEDIA_BASE_URL || "https://media.filmbase.fun"
export const LOCAL_MEDIA_PATH = "local-spider-man-brand-new-day-2026"

export const localSpiderTitle: CatalogTitle = {
  id: "local:spider-man-brand-new-day-2026",
  slug: LOCAL_MEDIA_PATH,
  type: "movie",
  title: "Spider-Man: Brand New Day",
  year: 2026,
  imageUrl: "https://image.tmdb.org/t/p/w780/mFD3aitQ9rVM6u01xWDL2vYCKLE.jpg",
  backdropUrl: "https://image.tmdb.org/t/p/w1280/qeQJx07rK2xm8SD2sJxFKhE7gs0.jpg",
  synopsis: "Four years after the events of No Way Home, Peter Parker lives alone and protects New York as Spider-Man in full time. As a strange new crime emerges, a surprising physical change threatens his existence while he faces one of his most powerful enemies yet.",
  genres: ["Science Fiction", "Action", "Adventure"],
  countries: ["United States"],
  languages: ["English"],
  rating: null,
  status: "complete",
  latestEpisode: null,
  date: "2026-07-31",
  providers: [{ provider: "local", id: LOCAL_MEDIA_PATH, path: LOCAL_MEDIA_PATH }],
}

export function localOffers(): SourceOffer[] {
  return [{
    id: "local:spider-man-brand-new-day-2026:1080p",
    provider: "local",
    label: "1080p MP4",
    url: `${MEDIA_BASE}/Spider-Man-Brand-New-Day-2026-1080p-(FilmBase.fun).mp4`,
    season: null,
    episode: null,
    quality: "1080p",
    container: "mp4",
    codec: "H.264",
    size: "5.56 GB",
    audio: "AAC",
    subtitles: [],
    externalHost: "media.filmbase.fun",
    lastVerifiedAt: new Date().toISOString(),
  }]
}
