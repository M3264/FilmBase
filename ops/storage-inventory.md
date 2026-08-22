# FilmBase VPS Storage Inventory

Captured 2026-08-22.

## Required Runtime

- `filmbase-preview.service`: Next.js FilmBase UI on port `3310`.
- `filmbase-api2.service`: API2 backend on port `3264`.
- `nginx`: public reverse proxy for `filmbase.fun`.
- `filmbase-watchdog.timer`: restarts the UI after failed health or memory checks.
- `filmbase-route-check.timer`: checks public routes every five minutes.
- TMDB: server-side metadata enrichment using the private systemd token.
- Media origin: `161.97.114.154:8006`.

## Keep

- `/home/ubuntu/filmbase-workspace`
- `/home/ubuntu/filmbase-build/FilmBase/.next/standalone`
- `/home/ubuntu/filmbase-build/FilmBase/.next/static`
- `/home/ubuntu/filmbase-build/FilmBase/public`
- `/etc/systemd/system/filmbase-preview.service*`
- `/etc/systemd/system/filmbase-api2.service`
- `/etc/systemd/system/filmbase-watchdog*`
- `/etc/systemd/system/filmbase-route-check*`
- FilmBase nginx configuration.
- The TMDB systemd environment drop-in.

## Safe Cleanup Candidates

Measured on the VPS:

- `/home/ubuntu/filmbase-workspace/.next` - about `257 MB`.
- `/home/ubuntu/filmbase-build/FilmBase/.next/cache` - about `125 MB`.
- `/home/ubuntu/filmbase-build/FilmBase/node_modules` - about `1.2 GB`; production uses the standalone runtime instead.
- `/home/ubuntu/filmbase-workspace/node_modules` - about `503 MB`; needed only for future builds in the workspace.
- `/home/ubuntu/.npm` - about `331 MB`; npm download cache.
- `/home/ubuntu/filmbase-staging` - about `132 MB`, after confirming it is unused.

The largest low-risk FilmBase cleanup is duplicate `node_modules` plus build caches. This can recover roughly 2 GB without affecting the running standalone service, but removing workspace `node_modules` means dependencies must be installed again before the next build.

## Unrelated Storage

These were found outside the FilmBase runtime and should only be removed after confirming they are no longer needed:

- `/home/ubuntu/portfolio`
- `/home/ubuntu/dextg`
- `/home/ubuntu/sparkdb`
- `/home/ubuntu/ippp`
- `/home/ubuntu/.hermes`
- `/home/ubuntu/.opencode`
- `/home/ubuntu/.cache`
- `/home/ubuntu/android-sdk`
- `/home/ubuntu/gradle`
- `/home/ubuntu/.bun`

Docker reported no meaningful disk usage. Ollama is disabled and is not part of FilmBase.

## Important Caution

Do not remove the standalone directory, public assets, systemd units, nginx configuration, or the TMDB environment drop-in while FilmBase is running.
