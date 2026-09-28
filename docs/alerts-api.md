# FilmBase alerts API

Base URL: `https://filmbase.top`. All dates use UTC. No authentication is needed to read alerts or picks. Bots are responsible for sending messages to their users.

## Polling

`GET /api/v1/alerts?after=<cursor>&limit=50` returns events in ID order. Omit `after` to read retained events. Save the returned `cursor` after processing the events. `limit` defaults to 50 and can be 1–100. Follow `hasMore` with another request using the new cursor. Events are retained for 30 days. An expired cursor returns HTTP 410 with `retainedSince`; consumers should reset their cursor and reconcile as needed.

```json
{
  "events": [{
    "id": "42", "kind": "filmbase_new", "title": "Example Movie (2026)",
    "contentType": "movie", "poster": "https://example.com/poster.jpg",
    "date": "2026-09-28", "source": "FilmBase",
    "url": "https://filmbase.top/movie/fb-411522",
    "availableOnFilmBase": true, "publishedAt": "2026-09-28T12:00:00.000Z"
  }],
  "cursor": "42", "hasMore": false, "retainedSince": "39"
}
```

`filmbase_new` means a newly listed FilmBase movie, series, or anime. `tmdb_theatrical` and `tmdb_digital` mean the earliest reported worldwide theatrical or digital date for a movie, respectively. TMDB events have `source: "TMDB"`, `availableOnFilmBase: false`, and a `https://www.themoviedb.org/movie/...` URL. A TMDB event does not imply a FilmBase listing.

## Server-Sent Events

`GET /api/v1/alerts/stream` emits `event: alert` with the same JSON event and numeric `id`. Reconnect with the `Last-Event-ID` header or `?after=` query. The server sends comment keepalives about every 15 seconds. An expired cursor returns HTTP 410. SSE clients should still persist their last successfully processed ID.

```text
: connected

id: 42
event: alert
data: {"id":"42","kind":"filmbase_new",...}

: keepalive
```

## Picks

`GET /api/v1/picks/daily` returns `{ "date": "2026-09-28", "pick": { "title": "...", "poster": "...", "url": "https://filmbase.top/movie/fb-...", "contentType": "movie", "source": "FilmBase" } }`. The pick stays fixed for each UTC day after that day's first successful catalogue sync.

`GET /api/v1/picks/random` returns a FilmBase movie object in the same `pick` shape on demand, without the `date` wrapper. A pick endpoint returns HTTP 503 until the first successful catalogue sync.

## Minimal polling bot

```js
let cursor = loadCursorFromDisk();
async function poll() {
  let more;
  do {
    const url = new URL('https://filmbase.top/api/v1/alerts');
    if (cursor) url.searchParams.set('after', cursor);
    const response = await fetch(url);
    if (response.status === 410) { cursor = null; saveCursorToDisk(cursor); return; }
    if (!response.ok) throw new Error(`FilmBase returned ${response.status}`);
    const page = await response.json();
    for (const event of page.events) {
      await sendMessage(`${event.title} — ${event.kind}\n${event.url}`);
      cursor = event.id;
      saveCursorToDisk(cursor);
    }
    more = page.hasMore;
  } while (more);
}
setInterval(() => poll().catch(console.error), 5 * 60 * 1000);
```

## Operations and credits

The private `POST /api/v1/alerts/sync` endpoint requires `Authorization: Bearer <FILMBASE_ALERTS_SYNC_SECRET>`. The Docker runner calls it every five minutes. The first successful FilmBase sync establishes a baseline without publishing old listings. API2's normalized `latest` feed is a fixed window and cached upstream, so a prolonged outage beyond that window cannot be reconstructed. A failed check preserves the last good snapshot. TMDB scans one UTC day per successful scheduled run, catching up after downtime; each release type considers the 20 most popular discover results and verifies the earliest date with TMDB release details.

On the `.top` Coolify app, use the Docker runner and persistent volume described below. The public proxy should pass `/api/v1/alerts/stream` without response buffering and with a read timeout longer than the keepalive interval.

### TMDB credits

![TMDB logo](../public/tmdb-logo.svg)

This product uses the TMDB API but is not endorsed or certified by TMDB. See [TMDB's attribution requirements](https://developer.themoviedb.org/docs/faq) and [release date API](https://developer.themoviedb.org/reference/movie-release-dates).

### Coolify deployment for filmbase.top

FilmBase's `.top` app runs on a different VPS under Coolify. The Docker image starts the web server and checks the authenticated sync endpoint immediately and every five minutes. It creates a private runtime sync secret if `FILMBASE_ALERTS_SYNC_SECRET` is not configured. The first successful FilmBase sync establishes the baseline and populates the movie picks. `ops/filmbase-alerts-sync.mjs` remains available to run a manual sync inside the container when a secret is explicitly configured.

For production durability, add [Coolify persistent storage](https://coolify.io/docs/applications/configuration/persistent-storage) with destination `/app/data`. The image declares this as a Docker volume, but an explicit Coolify mount is needed to retain the same state across image replacements. Keep the app at one running replica because the state is a local file. Set `TMDB_API_READ_TOKEN` as a runtime environment variable in Coolify to enable TMDB release events. `FILMBASE_ALERTS_FILE` defaults to `/app/data/alerts.json`.

Check `/api/v1/alerts`, both pick endpoints, and an SSE connection through the public `.top` proxy after deployment. The SSE response sets `X-Accel-Buffering: no`; if the proxy buffers streams, disable buffering for `/api/v1/alerts/stream` in the proxy configuration.
