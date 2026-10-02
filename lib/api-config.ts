export const FILMBASE_API_URL = (process.env.FILMBASE_API_URL || "https://api.filmbase.top").replace(/\/$/, "")
export const FILMBASE_ANIME_API_URL = (process.env.FILMBASE_ANIME_API_URL || process.env.FILMBASE_LEGACY_API_URL || "https://api.filmbase.fun").replace(/\/$/, "")
