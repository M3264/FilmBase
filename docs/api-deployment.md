# Movie API deployment

Nkiri and 9jarocks use one upstream: `https://api.filmbase.top`.
Set `FILMBASE_API_URL` to override it. The old `FILMBASE_API2_URL` setting no longer controls movie requests.
The UI keeps the existing provider adapters and movie URLs; both adapters, download streaming, and alerts now use the same deployment.

Anime continues to use `https://api.filmbase.fun`. Set `FILMBASE_ANIME_API_URL` to override its server-side upstream; `FILMBASE_LEGACY_API_URL` is retained as an anime-only fallback for existing deployments.

The UI health route checks `/v1/health`, including the upstream database status.
